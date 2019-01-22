/* eslint prefer-rest-params:0, no-nested-ternary:0 */
export default class Range {
  /**
   * Adapted from a combination of Range and _Compound in the
   * Dalliance Genome Explorer, (c) Thomas Down 2006-2010.
   */
  constructor() {
    this._ranges =
      arguments.length === 2
        ? [{ min: arguments[0], max: arguments[1] }]
        : 0 in arguments[0]
        ? Object.assign({}, arguments[0])
        : [arguments[0]]
  }

  min() {
    return this._ranges[0].min
  }

  max() {
    return this._ranges[this._ranges.length - 1].max
  }

  contains(pos) {
    for (let s = 0; s < this._ranges.length; s += 1) {
      const r = this._ranges[s]
      if (r.min <= pos && r.max >= pos) {
        return true
      }
    }
    return false
  }

  isContiguous() {
    return this._ranges.length > 1
  }

  ranges() {
    return this._ranges.map(r => new Range(r.min, r.max))
  }

  toString() {
    return this._ranges.map(r => `[${r.min}-${r.max}]`).join(',')
  }

  union(s1) {
    const s0 = this
    const ranges = s0
      .ranges()
      .concat(s1.ranges())
      .sort(this.rangeOrder)
    const oranges = []
    let current = ranges[0]

    for (let i = 1; i < ranges.length; i += 1) {
      const nxt = ranges[i]
      if (nxt.min() > current.max() + 1) {
        oranges.push(current)
        current = nxt
      } else if (nxt.max() > current.max()) {
        current = new Range(current.min(), nxt.max())
      }
    }
    oranges.push(current)

    if (oranges.length === 1) {
      return oranges[0]
    }
    return new Range(oranges)
  }

  intersection(s1) {
    let s0 = this
    const r0 = s0.ranges()
    const r1 = s1.ranges()
    const l0 = r0.length

    const l1 = r1.length
    let i0 = 0

    let i1 = 0
    const or = []

    while (i0 < l0 && i1 < l1) {
      s0 = r0[i0]

      let s1 = r1[i1]
      const lapMin = Math.max(s0.min(), s1.min())
      const lapMax = Math.min(s0.max(), s1.max())
      if (lapMax >= lapMin) {
        or.push(new Range(lapMin, lapMax))
      }
      if (s0.max() > s1.max()) {
        i1 += 1
      } else {
        i0 += 1
      }
    }

    if (or.length == 0) {
      return null // FIXME
    }
    if (or.length == 1) {
      return or[0]
    }
    return new Range(or)
  }

  coverage() {
    let tot = 0
    const rl = this.ranges()
    for (let ri = 0; ri < rl.length; ri += 1) {
      const r = rl[ri]
      tot += r.max() - r.min() + 1
    }
    return tot
  }

  rangeOrder(a, b) {
    if (arguments.length < 2) {
      b = a
      a = this
    }

    if (a.min() < b.min()) {
      return -1
    }
    if (a.min() > b.min()) {
      return 1
    }
    if (a.max() < b.max()) {
      return -1
    }
    if (b.max() > a.max()) {
      return 1
    }
    return 0
  }
}
