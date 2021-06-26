// Dependencies
import React, { Fragment } from "react";
import { shortenPhrase } from "../helpers";
import { Dialog, Transition } from "@headlessui/react";

// Types
import { Album } from "../../../types/src/types";

interface AlbumCardProps {
  album: Album;
}

interface AlbumCardState {
  max_title_len: number; // Determines viewable length of the album title
  max_artist_len: number; // Determines viewable length of the artist name
  modal_is_open: boolean;
}

export class AlbumCard extends React.Component<AlbumCardProps, AlbumCardState> {
  constructor(props: AlbumCardProps) {
    super(props);
    this.state = {
      max_title_len: 40,
      max_artist_len: 20,
      modal_is_open: false,
    };

    this.closeModal = this.closeModal.bind(this);
    this.openModal = this.openModal.bind(this);
  }

  closeModal() {
    this.setState({
      modal_is_open: false,
    });
  }

  openModal() {
    this.setState({
      modal_is_open: true,
    });
  }

  render() {
    // TEMPFIX. SHOULD BE REMOVED AFTER IMPROVING IMAGE SCRAPING
    const badAlbums = [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/S-K_2019.jpg/220px-S-K_2019.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/SethSentrySuperCoolTreeHouse.jpg/220px-SethSentrySuperCoolTreeHouse.jpg",
    ];

    // Placeholder image
    let imgSrc = "https://i.imgur.com/R6q9ogr.png";
    if (
      typeof this.props.album.coverURL !== "undefined" &&
      !badAlbums.includes(this.props.album.coverURL)
    ) {
      imgSrc = this.props.album.coverURL;
    }

    return (
      <>
        <div
          onClick={this.openModal}
          className="border border-gray-300 hover:border-pink-600 cursor-pointer shadow-2xl rounded-lg m-4 py-4 w-60 h-84 bg-gray-200 relative flex"
        >
          <div className="flex mx-auto px-2 h-36">
            <div className="m-auto">
              <p className="text-lg font-bold text-center">
                {shortenPhrase(
                  this.props.album.title,
                  this.state.max_title_len
                )}
              </p>
              <p className="italic text-xs text-center">by</p>
              <p className="text font-bold text-center">
                {shortenPhrase(
                  this.props.album.artist,
                  this.state.max_artist_len
                )}
              </p>
              <p className="text-center">
                {this.props.album.releaseDate.toDateString()}
              </p>
            </div>
          </div>
          <img
            alt="album cover"
            className="border border-black block mx-auto w-40 h-40 absolute bottom-4 left-0 right-0"
            src={imgSrc}
          />
        </div>

        {/* Modal adapted from Tailwind UI */}
        <Transition appear show={this.state.modal_is_open} as={Fragment}>
          <Dialog
            as="div"
            className="fixed inset-0 z-10 overflow-y-auto"
            onClose={this.closeModal}
          >
            <div className="min-h-screen px-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Overlay className="fixed inset-0" />
              </Transition.Child>

              {/* This element is to trick the browser into centering the modal contents. */}
              <span
                className="inline-block h-screen align-middle"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl border border-black">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    {this.props.album.title}
                  </Dialog.Title>
                  <p className="text-lg font-bold">{this.props.album.artist}</p>
                  <p className="text-sm text-gray-500">
                    {this.props.album.releaseDate.toString()}
                  </p>

                  <img
                    alt="album cover"
                    className="border border-black mx-auto my-4 w-96 h-96"
                    src={imgSrc}
                  />

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                      onClick={this.closeModal}
                    >
                      Back to the albums!
                    </button>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      </>
    );
  }
}
