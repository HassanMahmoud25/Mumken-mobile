import { useLocalSearchParams } from "expo-router";
import { RecordsScreen } from "../../components/RecordsScreen";
export default function Detail() {
  const { recordId } = useLocalSearchParams<{ recordId: string }>();
  return <RecordsScreen key={recordId} recordId={recordId} />;
}
