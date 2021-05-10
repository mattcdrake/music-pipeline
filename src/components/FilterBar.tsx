import React, { ChangeEvent } from "react";

interface FilterBarProps {
  updateDateFilter: (date: Date | undefined) => void;
  updateGenreFilter: (genre: string | undefined) => void;
  genreList: string[];
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
    this.handleGenreClick = this.handleGenreClick.bind(this);

    let newDate = new Date();
    newDate.setDate(newDate.getDate() + 1);
    this.props.updateDateFilter(newDate);

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
    this.props.updateDateFilter(newDate);
    this.setState((prevState) => ({
      currentDate: prevState.initialDate,
    }));
  }

  handleGenreClick(event: ChangeEvent<HTMLSelectElement>) {
    let newGenreFilter = undefined;
    // "None" should reset App's genre filter, represented by an undefined filter.
    if (event.target.value !== "none") {
      newGenreFilter = event.target.value;
    }
    this.props.updateGenreFilter(newGenreFilter);
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

        {/* Genre filter section */}
        <div>
          <label className="m-auto">
            Genre Filter
            <select
              className="mx-4"
              onChange={this.handleGenreClick}
              id="genreFilter"
              name="genres"
            >
              <option value="none">None</option>
              {this.props.genreList.map((genre) => (
                <option value={genre}>{genre}</option>
              ))}
            </select>
          </label>
        </div>
      </div>
    );
  }
}
