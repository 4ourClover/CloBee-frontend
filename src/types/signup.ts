

export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  nickname: string;
  phoneNumber: string;
  verificationCode: string;
  birthday: string;
  referralCode: string;
  agreeTerms: boolean;
}

export interface SignupFormErrors {
  nicknameError: string;
  emailError: string;
  passwordError: string;
  confirmPasswordError: string;
  phoneError: string;
  birthdayError: string;
}

export interface SignupStates {
  showVerification: boolean;
  isPhoneVerified: boolean;
  isCodeVerified: boolean;
  isCheckingEmail: boolean;
  isCheckingPhone: boolean;
}

export interface ModalState {
  isConfirmModalOpen: boolean;
  confirmMessage: string;
  onConfirmAction: () => void;
  isSuccess: boolean;
}