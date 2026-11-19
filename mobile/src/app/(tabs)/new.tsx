import { Redirect } from "expo-router";

// The Decode tab opens the photo picker from its tab press. If this route is ever opened directly, go Home.
export default function NewDecode() {
  return <Redirect href="/" />;
}
