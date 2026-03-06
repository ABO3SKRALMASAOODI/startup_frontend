import React from "react";
import { RiveComponent } from "@rive-app/react-canvas";

function Robot() {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <RiveComponent src="/assets/robot.riv" />
    </div>
  );
}

export default Robot;
