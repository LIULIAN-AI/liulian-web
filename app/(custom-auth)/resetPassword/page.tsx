'use client'
import styles from './../css/layout.module.css';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import type { FormProps } from 'antd';
import { Form, Input, Button, message} from 'antd'
import Link from 'next/link';
import { useRouter } from 'next/navigation'
import { postResetPassword, postAccountVerificationCode } from '@/app/api/login'
import { useTranslations } from 'next-intl';
// 在文件顶部添加正则表达式
const emailRegex = /^[\w.-]+@([\w-]+\.)+[\w-]{2,}$/;
type FieldType = {
  email?: string;
  passWord?: string;
  newPassword?: string;
  verificationCode?: string;
};
const SmsCountdownButton = () => {
  const t = useTranslations('Common');
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();
  const form = Form.useFormInstance();
  // 发送验证码
  const sendCode = async () => {
    try {
      const email = form.getFieldValue('email');
      if (!email) {
        message.error(t('emailVerify'));
        return;
      }
      // 验证格式
      if (!emailRegex.test(email)) {
        message.error(t('emailInvalid'));
        return;
      }
      // 1. 调用发送验证码API
      await postAccountVerificationCode({ email, type: 2 });
      // 2. 开始倒计时
      setCountdown(60);
      // 3. 提示用户
      message.success(t('verificationCodeSent'));
    } catch (error) {
      message.error(t('verificationCodeSendFailed'));
    }
  };
  // 倒计时逻辑
  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // 组件卸载时清理
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [countdown]);

  return (
    <Button
      className={styles.customLoginInputRightButton}
      type="primary"
      onClick={sendCode}
      disabled={countdown > 0}
      style={{ minWidth: 100 }}
    >
      {countdown > 0 ? `${countdown}S` : t('verifyEmail')}
    </Button>
  );
};
const ResetPassword = () => {
  const t = useTranslations('Common');
   const router = useRouter();
  const [form] = Form.useForm();
  // 注册接口
  const registerAccount = async (values: FieldType) => {
    try {
      if (!values.email || !values.passWord || !values.newPassword || !values.verificationCode) {
        message.error(t('requiredFields'));
        return;
      }
      await postResetPassword(values as any);
      message.success(t('resetSuccess'));
      router.push('/login');
    } catch (error) {
      message.error(t('resetFailed'));
    }
  };
  const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
    console.log('Success:', values);
    registerAccount(values);
  };
  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };
  const handleSubmit = () => {
    form.submit();
  };
  return (
    <div className={styles.customLogin}>
      <div className={styles.customLoginSignUpContainer}>
        <Link href="/login" className={styles.customLoginSignUp}>
          {t('signIn')}
        </Link>
      </div>
      <div className={styles.customLoginTitle}>
        <Image src="/images/login/nIcon.svg" alt="logo" width={50} height={50} />
        <div className={styles.customLoginTitleText}>{t('resetPassword')}</div>
      </div>
      <div className={styles.customLoginFormContainer}>
        <Form
          name="basic"
          form={form}
          labelCol={{ span: 0 }}
          wrapperCol={{ span: 24 }}
          style={{width: '80%'}}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item<FieldType>
            label={null}
            name="email"
            rules={[{ required: true, message: t('emailVerify') }]}
          >
            <Input className={styles.customLoginInput} placeholder={t('emailInput')} />
          </Form.Item>
          <Form.Item<FieldType>
            label={null}
            name="verificationCode"
            rules={[{ required: true, message: t('verificationCodeVerify') }]}
          >
            <div className={styles.customLoginInputContainer}>
              <Input className={`${styles.customLoginInput} ${styles.customLoginInputLeft}`} placeholder={t('verificationCodeVerify')} />
              <div className={styles.customLoginInputRight}>
                <SmsCountdownButton />
              </div>
            </div>
          </Form.Item>
          <Form.Item<FieldType>
            label={null}
            name="newPassword"
            rules={[
              { required: true, message: t('newPasswordVerify') },
              { min: 6, message: t('passwordMinLength') }
            ]}
          >
            <Input.Password className={styles.customLoginInput} placeholder={t('newPasswordInput')} />
          </Form.Item>

          <Form.Item<FieldType>
            label={null}
            name="passWord"
            rules={[
              { required: true, message: t('confirmPasswordVerify') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t('passwordNotMatch')));
                },
              }),
            ]}
          >
            <Input.Password className={styles.customLoginInput} placeholder={t('confirmPasswordInput')} />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 0, span: 24 }}>
            <div className={styles.customLoginButton} onClick={handleSubmit}>
              {t('continue')}
            </div>
          </Form.Item>
        </Form>
      </div>
      <div className={styles.customLoginForgotPassword}>
        <Link href="/login">{t('back')}</Link>
      </div>
    </div>
  )
}
export default ResetPassword;