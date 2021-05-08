import React, { ChangeEvent } from "react";

interface FilterBarProps {
  updateDateFilter: (date: Date) => void;
}

interface FilterBarState {
  currentDate: string;
  initialDate: string;
}

export class FilterBar extends React.Component<FilterBarProps, FilterBarState> {
  constructor(props: FilterBarProps) {
    super(props);
    this.handleDateClick = this.handleDateClick.bind(this);

    const inputDateStr = this.dateToInputStr();
    this.state = {
      currentDate: inputDateStr,
      initialDate: inputDateStr, // Used to determine when a filter is applied
    };
  }

  // Stores the inital value of the "month" filter selector.
  // I am creating this string to compare against the filter in the future.
  dateToInputStr(): string {
    let date = new Date();
    const monthStr =
      date.getMonth() >= 9 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`;
    return `${date.getFullYear()}-${monthStr}`;
  }

  // React to the month change by sending update to App
  handleDateClick(event: ChangeEvent<HTMLInputElement>) {
    this.setState({ currentDate: event.target.value });
    this.props.updateDateFilter(new Date(event.target.value));
  }

  // This needs to set initialDate when filters are removed
  handleFilterClick(event: ChangeEvent<HTMLInputElement>) {}

  render() {
    let removeFilter;
    if (this.state.currentDate !== this.state.initialDate) {
      removeFilter = "";
    }

    return (
      <div className="border rounded flex mt-12">
        <label>
          Date Filter:
          {removeFilter}
          <input
            type="month"
            className="mx-12"
            onChange={this.handleDateClick}
            value={this.state.currentDate}
          ></input>
        </label>

        <div className="border p-1 inline-block">Genre Filter</div>
        <div className="border p-1 inline-block ml-auto">Search bar</div>
      </div>
    );
  }
}
