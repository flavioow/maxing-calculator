/*  Define todas as medidas brutas possíveis
    extraídas do Figma ou de landmarks.

    Essas medidas são usadas para calcular
    as métricas do sistema.
*/

export type RawMeasurementId =
  // face
  | "face.height"
  | "face.width"
  | "face.upper_third_height"
  | "face.mid_third_height"
  | "face.lower_third_height"
  | "face.projection"
  | "face.convexity_angle"
  // eyes
  | "eyes.left_center_x"
  | "eyes.right_center_x"
  | "eyes.left_width"
  | "eyes.left_height"
  | "eyes.right_width"
  | "eyes.right_height"
  | "eyes.tilt_angle"
  | "eyes.outer_left_x"
  | "eyes.outer_right_x"
  // brows
  | "brows.left_inner_y"
  | "brows.right_inner_y"
  | "brows.left_outer_y"
  | "brows.right_outer_y"
  | "brows.tilt_angle"
  // midface
  | "midface.height"
  | "midface.width"
  | "zygoma.width"
  | "cheekbone.height"
  // jaw
  | "jaw.width"
  | "jaw.left_third_width"
  | "jaw.center_third_width"
  | "jaw.right_third_width"
  | "jaw.angle"
  | "jaw.gonial_angle"
  | "jaw.mandibular_plane_angle"
  | "jaw.ramus_length"
  // nose
  | "nose.width"
  | "nose.nasofrontal_angle"
  | "nose.nasolabial_angle"
  // mouth
  | "mouth.width"
  // chin / profile
  | "chin.height"
  | "philtrum.height"
  | "neck.width"
  | "profile.cervicomental_angle"

export type RawMeasurements = Partial<
  Record<RawMeasurementId, number>
>
