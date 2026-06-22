import { Divider, Input, Modal, Select, Space, Typography } from "antd";

const { Text } = Typography;

type SaveCollectionModalProps = {
  open: boolean;
  projectName: string;
  projectDescription: string;
  projectLabels: string[];
  availableLabels: string[];
  onProjectNameChange: (value: string) => void;
  onProjectDescriptionChange: (value: string) => void;
  onProjectLabelsChange: (value: string[]) => void;
  onCancel: () => void;
  onOk: (nextName: string, nextDescription: string, nextLabels: string[]) => void;
};

const SaveCollectionModal = ({
  open,
  projectName,
  projectDescription,
  projectLabels,
  availableLabels,
  onProjectNameChange,
  onProjectDescriptionChange,
  onProjectLabelsChange,
  onCancel,
  onOk,
}: SaveCollectionModalProps) => (
    <Modal
      open={open}
      title="Save to collection"
      onCancel={onCancel}
      onOk={() => onOk(projectName, projectDescription, projectLabels)}
      okButtonProps={{ disabled: !projectName.trim() }}
    >
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        <div>
          <Text strong>Project name</Text>
          <Input
            value={projectName}
            placeholder="Untitled project"
            onChange={(event) => onProjectNameChange(event.target.value)}
            onPressEnter={() => {
              if (projectName.trim()) {
                onOk(projectName, projectDescription, projectLabels);
              }
            }}
          />
        </div>
        <div>
          <Text strong>Description</Text>
          <Input.TextArea
            value={projectDescription}
            placeholder="Add a short description for this project"
            autoSize={{ minRows: 2, maxRows: 4 }}
            onChange={(event) => onProjectDescriptionChange(event.target.value)}
          />
        </div>
        <div>
          <Text strong>Labels</Text>
          <Select
            mode="tags"
            value={projectLabels}
            options={availableLabels.map((label) => ({ label, value: label }))}
            placeholder="Add labels"
            tokenSeparators={[","]}
            onChange={(values) => onProjectLabelsChange(values)}
          />
        </div>
        <Divider style={{ margin: "4px 0" }} />
        <Text type="secondary">
          Saved payload includes code, project settings, watched variables, variable overrides,
          and the current rendered visuals.
        </Text>
      </Space>
    </Modal>
);

export default SaveCollectionModal;
