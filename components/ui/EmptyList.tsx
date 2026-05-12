import { Result } from "antd";
import { InfoCircleOutlined } from '@ant-design/icons';

const EmptyList: React.FC = () => {
    return (
      <Result
        icon={<InfoCircleOutlined />}
        title="暂无数据"
        subTitle="目前没有符合筛选条件的信息，请调整筛选条件后重试。"
        style={{ marginTop: '50px', margin: '0 auto' }}
      />
    );
};

export default EmptyList;