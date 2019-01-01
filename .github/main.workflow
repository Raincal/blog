workflow "Hexo Blog" {
  on = "push"
  resolves = ["Deploy to Firebase"]
}

action "[Custom] Build hexo blog" {
  uses = "./.github/build-custom"
}

action "Deploy to Firebase" {
  uses = "Raincal/actions/deploy-firebase@master"
  needs = ["[Custom] Build hexo blog"]
  secrets = ["FIREBASE_TOKEN"]
}
