import {Environment} from "@react-three/drei";
import {Avatar} from "./Avatar.jsx";

export const Experience = ({ animationState = "Idle" }) => {
  return (
    <>
      <Avatar position={[0, -3, 5]} scale={2.1} animation={animationState} />
      <Environment preset="sunset" />
    </>
  );
};