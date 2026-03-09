import type { MeasurementInput } from "../types/input"
import { percentage, ratio } from "./geometry"
import type { RawMeasurements } from "./raw-measurements"

function hasValue(value: number | undefined): value is number {
  return value !== undefined
}

export function computeMetrics(raw: RawMeasurements): MeasurementInput {
  const metrics: MeasurementInput = {}
  /* ----------------------------
     FACE
  ---------------------------- */
  if (hasValue(raw["face.height"]) && hasValue(raw["face.width"])) {
    metrics["face.height_to_width_ratio"] = ratio(
      raw["face.height"],
      raw["face.width"],
    )
  }
  if (hasValue(raw["face.projection"]) && hasValue(raw["face.height"])) {
    metrics["face.projection_to_height_ratio"] = ratio(
      raw["face.projection"],
      raw["face.height"],
    )
  }
  if (hasValue(raw["face.convexity_angle"])) {
    metrics["face.convexity"] = raw["face.convexity_angle"]
  }

  /* ----------------------------
     FACE THIRDS
  ---------------------------- */
  if (
    hasValue(raw["face.upper_third_height"]) &&
    hasValue(raw["face.height"])
  ) {
    metrics["face.upper_third_height"] = percentage(
      raw["face.upper_third_height"],
      raw["face.height"],
    )
  }
  if (hasValue(raw["face.mid_third_height"]) && hasValue(raw["face.height"])) {
    metrics["face.mid_third_height"] = percentage(
      raw["face.mid_third_height"],
      raw["face.height"],
    )
  }
  if (
    hasValue(raw["face.lower_third_height"]) &&
    hasValue(raw["face.height"])
  ) {
    metrics["face.lower_third_height"] = percentage(
      raw["face.lower_third_height"],
      raw["face.height"],
    )
  }

  /* ----------------------------
     EYES
  ---------------------------- */
  if (
    hasValue(raw["eyes.left_center_x"]) &&
    hasValue(raw["eyes.right_center_x"]) &&
    hasValue(raw["face.width"])
  ) {
    const distance = raw["eyes.right_center_x"] - raw["eyes.left_center_x"]

    metrics["eyes.interpupillary_distance"] = ratio(distance, raw["face.width"])
  }

  if (
    hasValue(raw["eyes.left_center_x"]) &&
    hasValue(raw["eyes.right_center_x"]) &&
    hasValue(raw["eyes.left_width"]) &&
    hasValue(raw["eyes.right_width"])
  ) {
    const averageEyeWidth =
      (raw["eyes.left_width"] + raw["eyes.right_width"]) / 2

    const eyeGap =
      raw["eyes.right_center_x"] -
      raw["eyes.right_width"] / 2 -
      (raw["eyes.left_center_x"] + raw["eyes.left_width"] / 2)

    if (averageEyeWidth > 0) {
      metrics["eyes.spacing_ratio"] = ratio(eyeGap, averageEyeWidth)
    }
  }

  if (
    hasValue(raw["eyes.left_width"]) &&
    hasValue(raw["eyes.left_height"]) &&
    hasValue(raw["eyes.right_width"]) &&
    hasValue(raw["eyes.right_height"])
  ) {
    const averageWidth = (raw["eyes.left_width"] + raw["eyes.right_width"]) / 2

    const averageHeight =
      (raw["eyes.left_height"] + raw["eyes.right_height"]) / 2

    metrics["eyes.width_to_height_ratio"] = ratio(averageWidth, averageHeight)
  } else if (
    hasValue(raw["eyes.left_width"]) &&
    hasValue(raw["eyes.left_height"])
  ) {
    metrics["eyes.width_to_height_ratio"] = ratio(
      raw["eyes.left_width"],
      raw["eyes.left_height"],
    )
  } else if (
    hasValue(raw["eyes.right_width"]) &&
    hasValue(raw["eyes.right_height"])
  ) {
    metrics["eyes.width_to_height_ratio"] = ratio(
      raw["eyes.right_width"],
      raw["eyes.right_height"],
    )
  }
  if (hasValue(raw["eyes.tilt_angle"])) {
    metrics["eyes.tilt"] = raw["eyes.tilt_angle"]
  }

  /* ----------------------------
     BROWS
  ---------------------------- */
  if (hasValue(raw["brows.tilt_angle"])) {
    metrics["brows.tilt"] = raw["brows.tilt_angle"]
  }

  /* ----------------------------
     MIDFACE
  ---------------------------- */
  if (hasValue(raw["midface.height"]) && hasValue(raw["face.height"])) {
    metrics["midface.ratio"] = ratio(raw["midface.height"], raw["face.height"])
  }
  if (hasValue(raw["zygoma.width"]) && hasValue(raw["midface.height"])) {
    metrics["midface.zygoma_width_to_height_ratio"] = ratio(
      raw["zygoma.width"],
      raw["midface.height"],
    )
  }
  if (hasValue(raw["midface.width"]) && hasValue(raw["midface.height"])) {
    const widthToHeight = ratio(raw["midface.width"], raw["midface.height"])

    metrics["midface.width_to_height_ratio"] = widthToHeight

    metrics["midface.fwhr"] = widthToHeight
  }
  if (hasValue(raw["cheekbone.height"]) && hasValue(raw["face.height"])) {
    metrics["midface.cheekbone_height"] = ratio(
      raw["cheekbone.height"],
      raw["face.height"],
    )
  }

  /* ----------------------------
     JAW
  ---------------------------- */
  if (hasValue(raw["jaw.width"]) && hasValue(raw["zygoma.width"])) {
    metrics["jaw.width_to_zygoma_ratio"] = ratio(
      raw["jaw.width"],
      raw["zygoma.width"],
    )
  }
  if (hasValue(raw["jaw.width"]) && hasValue(raw["neck.width"])) {
    metrics["jaw.width_to_neck_ratio"] = ratio(
      raw["jaw.width"],
      raw["neck.width"],
    )
  }
  if (hasValue(raw["jaw.left_third_width"]) && hasValue(raw["jaw.width"])) {
    metrics["jaw.left_third_width"] = percentage(
      raw["jaw.left_third_width"],
      raw["jaw.width"],
    )
  }
  if (hasValue(raw["jaw.center_third_width"]) && hasValue(raw["jaw.width"])) {
    metrics["jaw.center_third_width"] = percentage(
      raw["jaw.center_third_width"],
      raw["jaw.width"],
    )
  }
  if (hasValue(raw["jaw.right_third_width"]) && hasValue(raw["jaw.width"])) {
    metrics["jaw.right_third_width"] = percentage(
      raw["jaw.right_third_width"],
      raw["jaw.width"],
    )
  }
  if (hasValue(raw["jaw.angle"])) {
    metrics["jaw.angle"] = raw["jaw.angle"]
  }
  if (hasValue(raw["jaw.gonial_angle"])) {
    metrics["jaw.gonial_angle"] = raw["jaw.gonial_angle"]
  }
  if (hasValue(raw["jaw.mandibular_plane_angle"])) {
    metrics["jaw.mandibular_plane_angle"] = raw["jaw.mandibular_plane_angle"]
  }
  if (hasValue(raw["jaw.ramus_length"])) {
    metrics["jaw.ramus_length"] = raw["jaw.ramus_length"]
  }

  /* ----------------------------
     NOSE
  ---------------------------- */

  if (hasValue(raw["nose.nasofrontal_angle"])) {
    metrics["nose.nasofrontal_angle"] = raw["nose.nasofrontal_angle"]
  }
  if (hasValue(raw["nose.nasolabial_angle"])) {
    metrics["nose.nasolabial_angle"] = raw["nose.nasolabial_angle"]
  }

  /* ----------------------------
     PROFILE
  ---------------------------- */

  if (hasValue(raw["chin.height"]) && hasValue(raw["philtrum.height"])) {
    metrics["profile.chin_to_philtrum_ratio"] = ratio(
      raw["chin.height"],
      raw["philtrum.height"],
    )
  }
  if (hasValue(raw["profile.cervicomental_angle"])) {
    metrics["profile.cervicomental_angle"] = raw["profile.cervicomental_angle"]
  }

  return metrics
}
