// Dependencies
import React, { ChangeEvent } from "react";

interface FilterBarProps {
  updateDateFilter: (date: Date | undefined) => void;
  updateGenreFilter: (genre: string | undefined) => void;
  updateSearchFilter: (newFilter: string) => void;
  genreList: string[]; // List of genres to show as available genre filters
}

interface FilterBarState {
  currentDate: string; // The current date in the date filter, represented as "YYYY-MM" based on the month input element.
  initialDate: string; // The initial date in the date filter, represented as "YYYY-MM" based on the month input element.
}

export class FilterBar extends React.Component<FilterBarProps, FilterBarState> {
  constructor(props: FilterBarProps) {
    super(props);
    this.handleDateClick = this.handleDateClick.bind(this);
    this.handleDateFilterXClick = this.handleDateFilterXClick.bind(this);
    this.handleGenreClick = this.handleGenreClick.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);

    // Creates an initial date filter so only albums in the future are shown.
    this.props.updateDateFilter(new Date());

    const inputDateStr = this.dateToInputStr();
    this.state = {
      currentDate: inputDateStr,
      initialDate: inputDateStr,
    };
  }

  /**
   * Creates a string that adheres to the "month" input element format.
   *
   * @returns {string}
   */
  dateToInputStr(): string {
    let date = new Date();
    const monthStr =
      date.getMonth() >= 9 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`;
    return `${date.getFullYear()}-${monthStr}`;
  }

  /**
   * Called when the user updates the date filter. It will notify the parent
   * component and update internal state.
   *
   * @param {ChangeEvent<HTMLInputElement>} event Contains new date value
   */
  handleDateClick(event: ChangeEvent<HTMLInputElement>) {
    this.setState({ currentDate: event.target.value });
    let newDate = FilterBar.getFirstDayOfMonth(event.target.value);
    this.props.updateDateFilter(newDate);
  }

  /**
   * Removes active date filters when the user clicks the 'X'.
   */
  handleDateFilterXClick() {
    let newDate = FilterBar.getFirstDayOfMonth(this.state.initialDate);
    this.setState((prevState) => ({
      currentDate: prevState.initialDate,
    }));
    this.props.updateDateFilter(newDate);
  }

  /**
   * Called when the user selects a genre filter.
   *
   * @param {ChangeEvent<HTMLSelectElement>} event Contains new date value
   */
  handleGenreClick(event: ChangeEvent<HTMLSelectElement>) {
    let newGenreFilter = undefined;
    // "None" should reset App's genre filter, represented by an undefined filter.
    if (event.target.value !== "none") {
      newGenreFilter = event.target.value;
    }
    this.props.updateGenreFilter(newGenreFilter);
  }

  /**
   * Called when the user types something into the search bar.
   *
   * @param {ChangeEvent<HTMLInputElement>} event Contains search string
   */
  handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    let newSearchString = event.target.value;
    this.props.updateSearchFilter(newSearchString.toLowerCase());
  }

  /**
   * Takes a string (based on "Month" input element) and converts it to a date
   * that is the first day of a given month.
   *
   * @param {string} month Based on format of "month" input element
   * @returns {Date}
   */
  static getFirstDayOfMonth(month: string): Date {
    // Adding one because "month" input will return the day prior to the
    // selected month (ex. May 2021 -> 30 April 2021).
    let newDate = new Date(month);
    newDate.setDate(newDate.getDate() + 1);
    return newDate;
  }

  render() {
    let removeDateFilter;
    if (this.state.currentDate !== this.state.initialDate) {
      removeDateFilter = (
        <span
          onClick={this.handleDateFilterXClick}
          className="ml-4 cursor-pointer"
        >
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

        {/* Text search section */}
        <div>
          <label>
            Search:
            <input
              type="text"
              className="border mx-4"
              onChange={this.handleSearchChange}
            ></input>
          </label>
        </div>
      </div>
    );
  }
}
