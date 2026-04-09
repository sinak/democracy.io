import { useParams } from 'react-router-dom';
import { CampaignEditorScreen } from '../../components/CampaignEditorScreen';

export function CampaignEditShell() {
  const params = useParams();

  return <CampaignEditorScreen campaignId={params.campaignId} mode="edit" />;
}
