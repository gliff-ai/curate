import { render, fireEvent, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Metadata } from "../searchAndSort/interfaces";
import { AutoAssignDialog, AssignmentCount } from "./AutoAssignDialog";

const updateAssignees = jest.fn(
  (imageUids: string[], newAssinees: string[][]) => newAssinees
);

const collaborators = [
  { name: "Mike Jones", email: "mike@gliff.app" },
  { name: "John Smith", email: "john@gliff.app" },
  { name: "Sarah Williams", email: "sarah@gliff.app" },
  { name: "Elisabeth Johnson", email: "elisabeth@gliff.app" },
  { name: "David Brown", email: "david@gliff.app" },
];

const data: Metadata = require("../../examples/samples/metadata.json");
const metadata: Metadata = data.map((mitem, i) => ({
  id: String(i),
  assignees: [], // no image assigned
  ...mitem,
}));
const selectedUids = ["1", "2", "3", "4", "5"];

function changeOption(text: string, newText: string): void {
  // change option selected in a Select material ui component
  fireEvent.mouseDown(screen.getByText(text));
  fireEvent.click(within(screen.getByRole("listbox")).getByText(newText));
}

function initAssignmentCount(): AssignmentCount {
  const assignmentCount: AssignmentCount = {};
  collaborators.forEach(({ email }) => {
    assignmentCount[email] = 0;
  });
  return assignmentCount;
}

describe.only("new auto-assignment", () => {
  beforeEach(() => {
    render(
      <AutoAssignDialog
        collaborators={collaborators}
        selectedImagesUids={selectedUids}
        metadata={metadata}
        updateAssignees={updateAssignees}
      />
    );
    fireEvent.click(screen.getByRole("button"));
  });

  test("assignment on all images", () => {
    fireEvent.click(screen.getByText("Assign"));

    expect(updateAssignees.mock.calls[0][0]).toHaveLength(metadata.length); //imageUids and metadata should have the same length
    expect(updateAssignees.mock.calls[0][0]).toHaveLength(
      updateAssignees.mock.calls[0][1].length //imageUids and newAssignees should have the same length
    );
  });

  test("assignment on selected images", () => {
    changeOption("All", "Selected");
    fireEvent.click(screen.getByText("Assign"));

    expect(updateAssignees.mock.calls[0][0]).toHaveLength(selectedUids.length); //imageUids and selectedUids should have the same length
    expect(updateAssignees.mock.calls[0][0]).toHaveLength(
      updateAssignees.mock.calls[0][1].length //imageUids and newAssignees should have the same length
    );
  });

  test("assignees per image from 1 to N = number of collaborators", () => {
    fireEvent.mouseDown(screen.getByText("1"));
    const listbox = within(screen.getByRole("listbox"));

    expect(listbox.getByText(1)).toBeInTheDocument(); // min assignees per image = 1
    // max assignees per image = number of collaborators
    expect(listbox.getByText(collaborators.length)).toBeInTheDocument();
    expect(listbox.queryByText(collaborators.length + 1)).toBeNull();
  });

  test.each([1, 2, 3, 4, 5])(
    "assign each image to %s different collaborators",
    (assigneesPerImage: number) => {
      changeOption("1", String(assigneesPerImage));
      fireEvent.click(screen.getByText("Assign"));

      const assignmentCount: AssignmentCount = initAssignmentCount();
      const values = updateAssignees.mock.results[0].value.forEach(
        (assignees: string[]) => {
          assignees.forEach((email) => (assignmentCount[email] += 1)); //update assignees count

          // each image should be assigned to N = assigneesPerImage different collaborators
          const uniqueAssignees = new Set(assignees);
          expect(uniqueAssignees.size).toBe(assigneesPerImage);
        }
      );

      // the difference between collaborators in the number of images assigned should be of 1 image max
      const imagesPerCollab = Object.values(assignmentCount);
      expect(
        Math.max.apply(Math, imagesPerCollab) -
          Math.min.apply(Math, imagesPerCollab)
      ).toBeLessThanOrEqual(1);
    }
  );
});

describe.only("integrative auto-assignment", () => {
  beforeEach(() => {
    // assign the first two images
    metadata[0].assignees = [
      "mike@gliff.app",
      "john@gliff.app",
      "sarah@gliff.app",
    ];
    metadata[1].assignees = ["mike@gliff.app", "john@gliff.app"];

    render(
      <AutoAssignDialog
        collaborators={collaborators}
        selectedImagesUids={selectedUids}
        metadata={metadata}
        updateAssignees={updateAssignees}
      />
    );

    fireEvent.click(screen.getByRole("button"));
    changeOption("New", "Integrative"); // select integrative assignment
  });

  test("assign only partially assigned and unassigned images", () => {
    fireEvent.click(screen.getByText("Assign"));
    expect(updateAssignees.mock.calls[0][0]).toHaveLength(metadata.length - 1); // the already assigned image should not be reassigned
    expect(updateAssignees.mock.calls[0][0]).toHaveLength(
      updateAssignees.mock.calls[0][1].length //imageUids and newAssignees should have the same length
    );
  });

  it("the min number of assignees per image must be the max number of assignees per image from the initial assignment", () => {
    fireEvent.mouseDown(screen.getByText("3"));
    const listbox = within(screen.getByRole("listbox"));

    expect(listbox.queryByText("2")).toBeNull(); // the min number of assignees allowed should be 3
  });

  test.each([3, 4, 5])(
    "assign each image to %s different collaborators",
    (assigneesPerImage: number) => {
      changeOption("3", String(assigneesPerImage));
      fireEvent.click(screen.getByText("Assign"));

      const assignmentCount: AssignmentCount = initAssignmentCount();
      const values = updateAssignees.mock.results[0].value.forEach(
        (assignees: string[]) => {
          // each image should be assigned to N = assigneesPerImage different collaborators
          const uniqueAssignees = new Set(assignees);
          assignees.forEach((email) => (assignmentCount[email] += 1)); //update assignees count
          expect(uniqueAssignees.size).toBe(assigneesPerImage);
        }
      );

      metadata.forEach(({ assignees }) => {
        if ((assignees as string[]).length === assigneesPerImage) {
          (assignees as string[]).forEach(
            (email) => (assignmentCount[email] += 1)
          ); //update assignees count
        }
      });

      // the difference between collaborators in the number of images assigned should be of 1 image max
      const imagesPerCollab = Object.values(assignmentCount);
      expect(
        Math.max.apply(Math, imagesPerCollab) -
          Math.min.apply(Math, imagesPerCollab)
      ).toBeLessThanOrEqual(1);
    }
  );
});