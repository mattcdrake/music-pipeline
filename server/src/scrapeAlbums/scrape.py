from bs4 import BeautifulSoup
from urllib import request as urlreq, parse
from pandas import pandas as pd
import json
import time
import requests


def get_primary_link(row):
    elems = row.find_all('td')
    count = 0
    artist = ""
    title = ""

    for elem in elems:
        if count == 0:
            artist = elem.a['href'] if elem.find('a') else ""
        elif count == 1:
            title = elem.a['href'] if elem.find('a') else ""
        elif count == 2:
            break

        count += 1

    outval = artist if title == "" else title
    return outval



def scrape_wiki(url="https://en.wikipedia.org/wiki/List_of_2021_albums", skiprows=1):
    """
    Parses the HTML at the requested URL for <table> elements. It then calls a
    helper function to convert that HTML into a dictionary of dictionaries.
    That dictionary is converted to JSON and sent back as in the HTTP response.

    :return: JSON dump of the tables on the given Wiki page.
    """
    page = urlreq.urlopen(url)
    page_soup = BeautifulSoup(page, "html.parser")
    tables = page_soup.find_all("table", class_="wikitable")
    tables_dict = convert_wiki_tables(tables, skiprows)

    with open("data.json", "w") as json_file:
        json.dump(tables_dict, json_file)

    # return json.dumps(tables_dict)


def convert_wiki_tables(tables, skiprows: int):
    """
    Converts HTML tables (parsed by BeautifulSoup) into a dictionary of dictionaries. Uses dataframes for intermediate
    data representation. This is because pandas is good at handling tables where row/colspan > 1. These tables are not
    NxM since some cells in the HTML will account for more than one cell.

    :param tables: A list of <table> strings, parsed by BeautifulSoup
    :param skiprows: Number of rows to skip for each table
    :return: Dictionary of dictionaries
    """
    dict_tables = {"bad_tables": 0}

    for i, table in enumerate(tables):

        try:
            table_df = pd.read_html(str(table), header=0, flavor="bs4", skiprows=skiprows)[0]
            links = ["https://en.wikipedia.org{}".format(get_primary_link(row)) for row in table.find_all('tr')]
            images = []

            for link in links[2:]:
                req =  requests.post("http://flip3.engr.oregonstate.edu:35351/api/image-scraper", json={"wikiURL": link})
                data = req.json()
                img = "https://{}".format(data['imageURL'][2:])
                images.append(img)
                print(img)
                time.sleep(1)

            table_df['links'] = links[2:]
            table_df['images'] = images

            dict_tables[i] = table_df.where((pd.notnull(table_df)), None).to_dict("records")
        except:
            dict_tables["bad_tables"] = dict_tables.get("bad_tables", 0) + 1

    return dict_tables


if __name__ == '__main__':
    scrape_wiki()
