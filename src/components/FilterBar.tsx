import React, { ChangeEvent } from "react";

interface FilterBarProps {
  updateDateFilter: (date: Date | undefined) => void;
}

interface FilterBarState {
  currentDate: string;
  initialDate: string;
}

export class FilterBar extends React.Component<FilterBarProps, FilterBarState> {
  constructor(props: FilterBarProps) {
    super(props);
    this.handleDateClick = this.handleDateClick.bind(this);
    this.handleFilterClick = this.handleFilterClick.bind(this);

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
    let newDate = new Date(event.target.value);
    // Adding one because "month" input will return the day prior to the selected month (ex. May 2021 -> 30 April 2021)
    newDate.setDate(newDate.getDate() + 1);
    this.props.updateDateFilter(newDate);
  }

  // This needs to set initialDate when filters are removed
  handleFilterClick() {
    let newDate = new Date(this.state.initialDate);
    // Adding one because "month" input will return the day prior to the selected month (ex. May 2021 -> 30 April 2021)
    newDate.setDate(newDate.getDate() + 1);
    this.props.updateDateFilter(undefined);
    this.setState((prevState) => ({
      currentDate: prevState.initialDate,
    }));
  }

  render() {
    let removeDateFilter;
    if (this.state.currentDate !== this.state.initialDate) {
      removeDateFilter = (
        <span onClick={this.handleFilterClick} className="ml-4 cursor-pointer">
          &#x274C;
        </span>
      );
    }

    let removeGenreFilter;

    return (
      <div className="flex mt-12 mx-auto w-5/6 align-middle">
        {/* Date filter section */}
        <div>
          <label className="h-full align-middle m-auto">
            Date Filter:
            {removeDateFilter}
            <input
              type="month"
              className="border mx-4 align-middle cursor-pointer"
              onChange={this.handleDateClick}
              value={this.state.currentDate}
            ></input>
          </label>
        </div>
      </div>
    );
  }
}
