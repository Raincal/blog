workflow "Hexo Blog" {
  on = "push"
  resolves = ["Deploy to Firebase"]
}

action "Deploy to Coding" {
  uses = "./.github/build"
  secrets = ["CO_TOKEN"]
  env = {
    CO_REF = "git.dev.tencent.com/raincal/raincal"
    CO_USER = "raincal"
    CO_EMAIL = "cyj228@vip.qq.com"
  }
}

action "Deploy to Firebase" {
  uses = "Raincal/actions/deploy-firebase@master"
  needs = ["Deploy to Coding"]
  secrets = ["FIREBASE_TOKEN"]
}
