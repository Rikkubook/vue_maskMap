export default new Router({
  // mode: 'history',  // 有这句的删掉，没有就不用管
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    }
  ]
})