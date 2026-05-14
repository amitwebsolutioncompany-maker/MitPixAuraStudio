export function getLoginErrorMessage(error) {
  if (!error?.response && (error?.message === 'Network Error' || error?.code === 'ERR_NETWORK')) {
    return 'Try again';
  }

  return error?.response?.data?.message || error?.message || 'Login failed';
}
