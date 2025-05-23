import { useContext } from "react";
import { View, Text } from "react-native";
import Button from "../shared/Button";
import {userDetailsContext} from "../../context/context"
export default function ProgressBar() {
  const { userData, gainXP, updateCourse } = useContext(userDetailsContext);

  console.log("userdata", userData);
  

  return (
    <View>
      <Text>Level: {userData?.level?.currentLevel}</Text>
      <Text>XP: {userData?.level?.xp}/{userData?.level?.nextLevelXP}</Text>
      <Button text={"Add XP"} onPress={() => gainXP(50)} />
    </View>
  );
}
