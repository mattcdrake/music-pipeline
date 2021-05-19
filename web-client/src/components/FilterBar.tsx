// Dependencies
import React, { ChangeEvent } from "react";

interface FilterBarProps {
  updateDateFilter: (date: Date | undefined) => void; // Updates parent component about active filters
  updateGenreFilter: (genre: string | undefined) => void; // Updates parent component about active filters
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
    let newDate = new Date(event.target.value);
    // Adding one because "month" input will return the day prior to the selected month (ex. May 2021 -> 30 April 2021)
    newDate.setDate(newDate.getDate() + 1);
    this.props.updateDateFilter(newDate);
  }

  /**
   * Removes active date filters when the user clicks the 'X'.
   */
  handleDateFilterXClick() {
    let newDate = new Date(this.state.initialDate);
    newDate.setDate(newDate.getDate() + 1);
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
      </div>
    );
  }
}
