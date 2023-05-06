export const getClosestNumber = (desiredNumber: number, arr: number[]) => {
  let closest = arr[0]
  let smallestDifference = Math.abs(desiredNumber - arr[0])
  for (let i = 1; i < arr.length; i++) {
    let difference = Math.abs(desiredNumber - arr[i])
    if (difference < smallestDifference) {
      smallestDifference = difference
      closest = arr[i]
    }
  }
  return closest
}
