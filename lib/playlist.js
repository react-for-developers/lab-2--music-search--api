const uuid = require("uuid/v4");
const GoogleSpreadsheet = require("google-spreadsheet");

module.exports = class PlaylistDB {
  constructor(spreadsheetId, { credentials }) {
    this.db = new GoogleSpreadsheet(spreadsheetId);
    this.credentials = this.db.useServiceAccountAuth(
      {
        client_email: credentials.email,
        private_key: credentials.privateKey
      },
      err => {
        if (err) {
          throw err;
        }

        this.db.getInfo((err, info) => {
          if (err) {
            throw err;
          }

          this.playlistTable = info.worksheets[0];
        });
      }
    );
  }

  getRows() {
    if (!this.playlistTable) {
      throw new Error("Missing playlist table");
    }

    return new Promise((resolve, reject) => {
      this.playlistTable.getRows((err, rows) => {
        if (err) {
          return reject(err);
        }

        resolve(
          rows.map(row => {
            const { id, playlistid, track } = row;
            return { id, playlistId: playlistid, track: JSON.parse(track) };
          })
        );
      });
    });
  }

  addRow(row) {
    if (!this.playlistTable) {
      throw new Error("Missing playlist table");
    }

    return new Promise((resolve, reject) => {
      this.playlistTable.addRow(row, (err, row) => {
        if (err) {
          return reject(err);
        }

        resolve(row);
      });
    });
  }

  async getPlaylist(playlistId) {
    if (!this.playlistTable) {
      throw new Error("Missing playlist table");
    }

    const rows = await this.getRows();
    return {
      data: rows.filter(row => row.playlistId === playlistId)
    };
  }

  async addTrackToPlaylist(playlistId, track) {
    const id = uuid();

    const row = {
      _id: id,
      playlistid: playlistId,
      track: JSON.stringify(track)
    };

    await this.addRow(row);
    return {
      data: {
        id,
        playlistId,
        track
      }
    };
  }
};
