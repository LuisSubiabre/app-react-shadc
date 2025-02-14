import { BallTriangle } from "react-loader-spinner";

const Spinner = () => {
  return (
    <div className="flex justify-center">
      <BallTriangle
        height={100}
        width={100}
        radius={5}
        color="gray"
        ariaLabel="ball-triangle-loading"
        wrapperStyle={{}}
        wrapperClass=""
        visible={true}
      />
    </div>
  );
};

export default Spinner;
