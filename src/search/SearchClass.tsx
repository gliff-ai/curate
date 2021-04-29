import React, { Component, ReactNode } from "react";
import { Metadata, MetaItem } from "./interfaces";
import ComboBox from "./ComboBox";

interface Props {
  filteredMeta?: Metadata;
}
interface State {
  filteredMeta: Metadata;
  metadata: Metadata;
  metadataKeys: string[];
}

export class SearchClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      filteredMeta: this.props.filteredMeta || [],
      metadata: [],
      metadataKeys: [],
    };
  }

  componentDidMount = () => {
    this.loadMeta("../examples/metadata.json", (data: Metadata): void => {
      // Load metadata from json file.
      if (data && data.length > 0) {
        this.setState({ metadata: data });
        this.setState({ metadataKeys: Object.keys(data[0]) });
      }
    });
  };

  private loadMeta(
    jsonUrl: string,
    onLoadCallback: (data: Metadata) => void
  ): void {
    const myRequest = new Request(jsonUrl);
    fetch(jsonUrl)
      .then((response) => response.json())
      .then((data) => {
        onLoadCallback(data);
      })
      .catch((err) => {
        console.log("Error while reading metadata.");
      });
  }

  private handleOnSubmit = (inputKey: string, inputValue: string): void => {
    if (inputKey === "" || inputValue === "") return;

    // Filter metadata based on inputKey and inputValue
    let filteredMeta: Metadata = [];
    this.state.metadata.forEach((mitem: MetaItem) => {
      for (const [key, value] of Object.entries(mitem)) {
        if (key === inputKey) {
          if (
            (typeof value === "object" && value.includes(inputValue)) ||
            value === inputValue
          ) {
            filteredMeta.push(mitem);
            break;
          }
        }
      }
    });
    console.log(filteredMeta);
    this.setState({ filteredMeta });
  };

  render = (): ReactNode => {
    return (
      <>
        <ComboBox
          metadata={this.state.metadata}
          metadataKeys={this.state.metadataKeys}
          callback={this.handleOnSubmit}
        />
      </>
    );
  };
}
