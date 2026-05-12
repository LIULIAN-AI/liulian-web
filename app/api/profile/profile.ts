import { apiClient } from "../apiClient";
// 定义请求和响应类型
export interface InviteRequest {
  emails: string[];
  data?: any
}

export interface InviteResponse {
  success?: boolean;
  message?: string;
  data?: any;
  token?: string;
}
// 定义明确的类型
interface PreferenceResponse {
  success?: boolean;
  message?: string;
  enablePersonalizedAI?: undefined;
  enableAppNotification?: undefined;
  emailNotification?: undefined;
  smsNotification?: undefined;
  email?: undefined;
  sms?: undefined;
}

interface PreferenceRequest {}


/**
 * 发送邀请邮件
 * @param data 邀请请求数据（含被邀请人邮箱等信息）
 * @param token 认证token（可选，默认null）
 */
export function PostEmail({
  data,
  token,
}: {
  data: InviteRequest;
  token?: string | null;
}) {
  const response = apiClient({
    url: '/api/invite-users',
    options: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
    token: token,
  });
  return response as InviteResponse;
}

/**
 * 从后端获取用户偏好设置
 * @param userId 用户ID
 */
export function getPreference(userId: string) {
  const response = apiClient({
    url: `/profile/preference/topics/${userId}`,
    options: {
      method: 'GET',
    },
  });
  return response as PreferenceResponse;
}

/**
 * 保存用户偏好设置到后端
 * @param userId 用户ID
 * @param data 用户偏好数据
 * @param token 认证token（可选，未传递时默认null）
 */
export function savePreference({
  userId,
  data,
  token,
}: {
  userId: string;
  data: PreferenceRequest;
  token?: string | null;
}) {
  const response = apiClient({
    url: `/profile/preference/topics/${userId}/update`,
    options: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    },
    token: token, // 传递token到apiClient
  });
  return response as PreferenceResponse;
}

/**
 * 从后端获取用户偏好设置-银行偏好
 * @param userId 用户ID
 */
export function getPreferenceBank(userId: string) {
  const response = apiClient({
    url: `/profile/preference/banks/${userId}`,
    options: {
      method: 'GET',
    },
  });
  return response as PreferenceResponse;
}

/**
 * 保存用户偏好设置到后端-银行偏好
 * @param userId 用户ID
 * @param data 用户偏好数据
 * @param token 认证token（可选，未传递时默认null）
 */
export function savePreferenceBank({
  userId,
  data,
  token,
}: {
  userId: string;
  data: PreferenceRequest;
  token?: string | null;
}) {
  const response = apiClient({
    url: `/profile/preference/banks/${userId}/update`,
    options: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    },
    token: token, // 传递token到apiClient
  });
  return response as PreferenceResponse;
}

/**
 * 从后端获取用户通知偏好设置
 * @param userId 用户ID
 */
export function getNotificationPreference(
  userId: string
) {
  const response = apiClient({
    url: `/profile/notification/${userId}`,
    options: {
      method: 'GET',
    },
  });
  return response as PreferenceResponse;
}

/**
 * 保存用户通知偏好设置
 * @param userId 用户ID
 * @param data 用户偏好数据
 * @param token 认证token（可选，从外部传入）
 */
export function saveNotificationPreference({
  userId,
  data,
  token,
}: {
  userId: string;
  data: PreferenceRequest;
  token?: string | null;
}) {
  const response = apiClient({
    url: `/profile/notification/${userId}/update`,
    options: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    },
    token: token, // 与示例完全一致：token作为apiClient的顶层参数传递
  });
  return response;
}

/**
 * 从后端获取用户信息
 * @param userId 用户ID
 */
export function getAccount(userId: string) {
  const response = apiClient({
    url: `/profile/subscription/info/${userId}`,
    options: {
      method: 'GET',
    },
  });
  return response as PreferenceResponse;
}

/**
 * 从后端获取用户所有邮箱
 * @param userId 用户ID
 */
export function getEmails(userId: string) {
  const response = apiClient({
    url: `/profile/subscription/info/${userId}`,
    options: {
      method: 'GET',
    },
  });
  return response as PreferenceResponse;
}

/**
 * 更新用户显示邮箱
 * @param userId 用户ID
 * @param displayEmail 要设置的显示邮箱
 * @param token 认证token（可选，未传递时默认null）
 */
export function sendSelectEmail({
  userId,
  displayEmail,
  token,
}: {
  userId: string;
  displayEmail: string;
  token?: string | null;
}) {
  // 定义键值对格式的请求体数据
  const data = { displayEmail };

  const response = apiClient({
    url: `/profile/subscription/${userId}/update-email`,
    options: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data), // 序列化对象
    },
    token: token, // 传递token到apiClient
  });
  return response as PreferenceResponse;
}

/**
 * 保存用户是否允许通过密码登录
 * @param userId 用户ID
 * @param enable 是否允许通过密码登录
 * @param token 认证token（可选，未传递时默认null）
 */
export function sendPemenantPassword({
  userId,
  enable,
  token,
}: {
  userId: string;
  enable: boolean;
  token?: string | null;
}) {
  // 定义键值对格式的请求体数据
  const data = { enable };

  const response = apiClient({
    url: `/profile/subscription/${userId}/update-enable-password`,
    options: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data), // 序列化对象
    },
    token: token, // 传递token到apiClient
  });
  return response as PreferenceResponse;
}

/**
 * 保存用户两步验证号码
 * @param userId 用户ID
 * @param phoneNumber 两步验证的电话号码
 * @param token 认证token（可选，未传递时默认null）
 */
export function sendTwoStep({
  userId,
  phoneNumber,
  token,
}: {
  userId: string;
  phoneNumber: string;
  token?: string | null;
}) {
  // 定义键值对格式的请求体数据（字段名与后端保持一致）
  const data = { phoneNumber };

  const response = apiClient({
    url: `/profile/subscription/${userId}/twoStep`,
    options: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data), // 序列化对象
    },
    token: token, // 传递token到apiClient
  });
  return response as PreferenceResponse;
}