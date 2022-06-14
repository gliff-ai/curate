import { render, fireEvent, screen, waitFor } from "@testing-library/react";
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
        defaultLabels={[]}
        restrictLabels={false}
        multiLabel
      />
    );
    fireEvent.click(screen.getByRole("button"));
  });

  test("image has previously assigned label", () => {
    expect(screen.queryByRole("span", { name: prevLabel })).toBeDefined();
    expect(screen.queryByRole("span", { name: newLabel })).toBeNull();
  });

  test("add a new label", () => {
    const chipElement = screen.queryByRole("span", { name: newLabel });

    expect(chipElement).toBeNull();
    fireEvent.change(screen.getByPlaceholderText("New label"), {
      target: { value: newLabel },
    });
    fireEvent.click(screen.getByRole("button", { name: "add-label" }));

    expect(chipElement).toBeDefined();
  });

  test("cannot add duplicate labels", () => {
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
    const chipElement = screen.queryByRole("span", { name: prevLabel });
    expect(chipElement).toBeDefined();
    fireEvent.click(screen.getByTestId(`delete-${prevLabel}`));

    await waitFor(() => {
      expect(chipElement).toBeNull();
    });
  });
});
