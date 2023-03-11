import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import TextResult from "./TextResult";
import ImageResult from "./ImageResult";
import LottieResult from "./LottieResult";
import Grid from "@mui/material/Grid";

export default function SearchPanel(props) {
  const selectedText = props.selectedText;
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
            defaultValue={selectedText}
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
          <TextResult selectedText={selectedText} />
          <ImageResult selectedText={selectedText} />
          {/* <LottieResult selectedText={selectedText} /> */}
        </Grid>
      </Grid>
    </div>
  );
}
