import AnimationIcon from "@mui/icons-material/Animation";
import Lottie from "react-lottie";
import AnimatedHeart1 from "../../resources/lotties/heart1.json";
import AnimatedHeart2 from "../../resources/lotties/heart2.json";
import AnimatedHeart3 from "../../resources/lotties/heart3.json";
import AnimatedHeart4 from "../../resources/lotties/heart4.json";
import AnimatedHeart5 from "../../resources/lotties/heart5.json";

export default function LottieResult(props) {
  const selectedText = props.selectedText;
  const renderOption1 = {
    loop: true,
    autoplay: true,
    animationData: AnimatedHeart1,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const renderOption2 = {
    loop: true,
    autoplay: true,
    animationData: AnimatedHeart2,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const renderOption3 = {
    loop: true,
    autoplay: true,
    animationData: AnimatedHeart3,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const renderOption4 = {
    loop: true,
    autoplay: true,
    animationData: AnimatedHeart4,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const renderOption5 = {
    loop: true,
    autoplay: true,
    animationData: AnimatedHeart5,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  return (
    <div className="result-container">
      <div className="icon-caption">
        <div className="caption-icon">
          <AnimationIcon fontSize="small" className="indicateIcon" />{" "}
        </div>
        <div className="caption-text">lottie file</div>
      </div>
      <div className="search-content-container" id="lottie-content-container">
        <div className="lottie-item search-return-item" id="lottie-item1">
          <Lottie options={renderOption1} height={60} width={60} />
        </div>
        <div className="lottie-item search-return-item" id="lottie-item2">
          <Lottie options={renderOption2} height={60} width={60} />
        </div>
        <div className="lottie-item search-return-item" id="lottie-item3">
          <Lottie options={renderOption3} height={60} width={60} />
        </div>
        <div className="lottie-item search-return-item" id="lottie-item4">
          <Lottie options={renderOption4} height={60} width={60} />
        </div>
        <div className="lottie-item search-return-item" id="lottie-item5">
          <Lottie options={renderOption5} height={60} width={60} />
        </div>
      </div>
    </div>
  );
}
