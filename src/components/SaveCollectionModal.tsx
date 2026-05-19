import { Divider, Modal, Typography } from "antd";

const { Text } = Typography;

type SaveCollectionModalProps = {
  open: boolean;
  projectName: string;
  onCancel: () => void;
  onOk: () => void;
};

const SaveCollectionModal = ({ open, projectName, onCancel, onOk }: SaveCollectionModalProps) => (
  <Modal open={open} title="Save to collection" onCancel={onCancel} onOk={onOk}>
    <Text>Save the current project as <Text strong>{projectName.trim() || "Untitled project"}</Text>.</Text>
    <Divider />
    <Text type="secondary">Saved payload includes code, project settings, watched variables, variable overrides, and the current rendered visuals.</Text>
  </Modal>
);

export default SaveCollectionModal;
