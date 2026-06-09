import { Alert, Button, Space } from "antd";

type ErrorStateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

const ErrorState = ({ title, message, actionLabel, onAction }: ErrorStateProps) => (
  <Space direction="vertical" size={12} style={{ width: "100%" }}>
    <Alert
      type="error"
      showIcon
      message={title}
      description={message}
    />
    {actionLabel && onAction ? (
      <div>
        <Button onClick={onAction}>{actionLabel}</Button>
      </div>
    ) : null}
  </Space>
);

export default ErrorState;
