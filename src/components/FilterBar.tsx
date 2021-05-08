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
    this.props.updateDateFilter(new Date(event.target.value));
  }

  // This needs to set initialDate when filters are removed
  handleFilterClick() {
    this.props.updateDateFilter(new Date(this.state.initialDate));
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
