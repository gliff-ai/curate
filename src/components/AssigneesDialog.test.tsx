import { UserAccess } from "@/interfaces";
import { render, fireEvent, screen } from "@testing-library/react";
import { AssigneesDialog } from "./AssigneesDialog";

const updateAssignees = jest.fn(
  (imageUids: string[], newAssinees: string[][]) => newAssinees
);

const profiles = [
  { name: "Mike Jones", email: "mike@gliff.app", access: UserAccess.Owner },
  { name: "John Smith", email: "john@gliff.app", access: UserAccess.Member },
  {
    name: "Sarah Williams",
    email: "sarah@gliff.app",
    access: UserAccess.Collaborator,
  },
  {
    name: "Elisabeth Johnson",
    email: "elisabeth@gliff.app",
    access: UserAccess.Member,
  },
  {
    name: "David Brown",
    email: "david@gliff.app",
    access: UserAccess.Collaborator,
  },
];

const prevAssignee = { name: "Mike Jones", email: "mike@gliff.app" };

const addAssignees = [
  { name: "John Smith", email: "john@gliff.app" },
  { name: "Sarah Williams", email: "sarah@gliff.app" },
];

const getCurrentAssignees = jest.fn(() => [prevAssignee.email]);

const selectedUids = ["1", "2", "3"];

describe("manual image assignment", () => {
  describe("without profiles", () => {
    beforeEach(() => {
      render(
        <AssigneesDialog
          profiles={[]}
          selectedImagesUids={selectedUids}
          updateAssignees={updateAssignees}
          getCurrentAssignees={getCurrentAssignees}
        />
      );
      fireEvent.click(screen.getByRole("button")); // open dialog
    });

    test("cannot open dialog", () => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  describe("with profiles", () => {
    beforeEach(() => {
      render(
        <AssigneesDialog
          profiles={profiles}
          selectedImagesUids={selectedUids}
          updateAssignees={updateAssignees}
          getCurrentAssignees={getCurrentAssignees}
        />
      );

      fireEvent.click(screen.getByRole("button")); // open dialog
    });

    test("can open dialog", () => {
      expect(screen.queryByRole("dialog")).toBeDefined();
    });

    test("add new assignees", () => {
      fireEvent.mouseDown(screen.getByText("mike@gliff.app")); // open dropdown
      for (const assignee of addAssignees) {
        fireEvent.click(screen.getByText(assignee.name)); // add new assignee
      }
      fireEvent.click(screen.getByText("Assign"));

      const expectedNewAssignees = new Array(selectedUids.length).fill(
        [prevAssignee.email].concat(addAssignees.map(({ email }) => email))
      );
      expect(updateAssignees.mock.calls[0][1]).toEqual(expectedNewAssignees);
    });

    test("remove assignee", () => {
      fireEvent.mouseDown(screen.getByText("mike@gliff.app")); // open dropdown
      fireEvent.click(screen.getByText(prevAssignee.name));
      fireEvent.click(screen.getByText("Assign")); // remove assignee

      const expectedNewAssignees = new Array(selectedUids.length).fill([]);
      expect(updateAssignees.mock.calls[0][1]).toEqual(expectedNewAssignees);
    });
  });
});
