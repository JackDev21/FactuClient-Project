const isUserLoggedIn = () => {

  // if (sessionStorage.token) {
  //   return true
  // }

  // return sessionStorage.token ? true : false

  return !!sessionStorage.token
}

export default isUserLoggedIn