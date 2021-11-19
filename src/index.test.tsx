import { render, fireEvent } from "@testing-library/react";
import { Metadata } from "@/interfaces";
import UserInterface from "./index";

const metadata = (require("../examples/samples/metadata.json") as Metadata).map(
  (mitem, i) => ({
    id: String(i),
    imageName: `sample${i}.png`,
    ...mitem,
  })
);

const getComponent = (isOwner: boolean): JSX.Element => (
  <UserInterface
    metadata={metadata}
    showAppBar
    collaborators={[{ name: "Mike Jones", email: "mike@gliff.app" }]}
    userIsOwner={isOwner}
  />
);

describe("owners access", () => {
  beforeEach(() => {
    render(getComponent(true));
  });

  test("can upload an image", () => {
    expect(document.querySelector("#upload-image")).not.toBeNull();
  });

  test("can manually assign images", () => {
    fireEvent.click(document.querySelector("#select-multiple-images"));
    expect(document.querySelector("#update-assignees")).not.toBeNull();
  });

  test("can auto-assign images", () => {
    expect(document.querySelector("#auto-assign-images")).not.toBeNull();
  });
});

describe("collaborators access", () => {
  beforeEach(() => {
    render(getComponent(false));
  });

  test("cannot upload an image", () => {
    expect(document.querySelector("#upload-image")).toBeNull();
  });

  test("cannot manually assign images", () => {
    fireEvent.click(document.querySelector("#select-multiple-images"));
    expect(document.querySelector("#update-assignees")).toBeNull();
  });

  test("cannot auto-assign images", () => {
    expect(document.querySelector("#auto-assign-images")).toBeNull();
  });
});
