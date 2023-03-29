import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import TextResult from "./TextResult";
import ImageResult from "./ImageResult";
import LottieResult from "./LottieResult";
import Grid from "@mui/material/Grid";
import { useEffect, useState } from "react";

export default function SearchPanel(props) {
  return (
    <div>
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="stretch"
        spacing={1}
      >
        <Grid item>
          <TextField
            id="search-bar"
            defaultValue={props.selectedText}
            variant="filled"
            type="search"
            fullWidth
            InputProps={{
              startAdornment: (
                <SearchIcon fontSize="small" className="indicateIcon" />
              ),
              disableUnderline: true,
            }}
          />
        </Grid>
        <Grid item>
          <TextResult selectedText={props.selectedText} />
          <ImageResult selectedText={props.selectedText} />
          {/* <LottieResult selectedText={props.selectedText} /> */}
        </Grid>
      </Grid>
    </div>
  );
}
