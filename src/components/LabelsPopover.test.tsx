import {
  render,
  fireEvent,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { LabelsPopover } from "./LabelsPopover";

const updateLabels = jest.fn((newLables: string[]) => newLables);
const prevLabel = "label1";
const newLabel = "label2";

describe("labels assignment", () => {
  beforeEach(() => {
    render(
      <LabelsPopover
        id="1"
        imageName="sample0.png"
        labels={[prevLabel]}
        updateLabels={updateLabels}
      />
    );
    fireEvent.click(screen.getByRole("button"));
  });

  test("image has previously assigned label", () => {
    expect(screen.getByText(prevLabel)).toBeInTheDocument();
  });

  test("add a new label", () => {
    expect(screen.queryByText(newLabel)).toBeNull();
    fireEvent.change(screen.getByPlaceholderText("New label"), {
      target: { value: newLabel },
    });
    fireEvent.click(screen.getByRole("button", { name: "add-label" }));
    expect(screen.getByText(newLabel)).toBeInTheDocument();
  });

  test("cannot add duplicate labels", async () => {
    const addLabelButton = screen.getByRole("button", { name: "add-label" });
    const inputField = screen.getByPlaceholderText("New label");
    expect(screen.getAllByText(/label*/i)).toHaveLength(1);

    // after adding a new label the image should have two labels
    fireEvent.change(inputField, { target: { value: newLabel } });
    fireEvent.click(addLabelButton);
    expect(screen.getAllByText(/label*/i)).toHaveLength(2);

    // after adding a duplicate label the image should still have two labels
    fireEvent.change(inputField, { target: { value: newLabel } });
    fireEvent.click(addLabelButton);
    expect(screen.getAllByText(/label*/i)).toHaveLength(2);
  });

  test("delete a label", async () => {
    expect(screen.queryByText(prevLabel)).toBeDefined();
    fireEvent.click(screen.getByText(prevLabel));
    try {
      await waitForElementToBeRemoved(screen.getByText(prevLabel));
      expect(screen.queryByText(prevLabel)).toBeNull();
    } catch (e) {
      console.log(e);
    }
  });
});
