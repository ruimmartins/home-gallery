import Hammer from "hammerjs"

export const vHammerSwipe = (el, binding) => {
  const hammer = new Hammer(el)
  hammer.on("swipeleft swiperight", (e) => {
    binding.value(e.type)
  })
}
