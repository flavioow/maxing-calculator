import type { Model } from "../types/model"

export const caucasianFemaleModel: Model = {
  id: "caucasian_female",
  pillars: [
    {
      id: "harmony",
      weight: 0.35,
      groups: [
        {
          id: "global_proportions",
          weight: 0.4,
          metrics: [
            {
              id: "face.upper_third_height",
              type: "target",
              ideal: 0.33,
              tolerance: 0.04,
              weight: 0.07,
            },
            {
              id: "face.mid_third_height",
              type: "target",
              ideal: 0.33,
              tolerance: 0.04,
              weight: 0.07,
            },
            {
              id: "face.lower_third_height",
              type: "target",
              ideal: 0.34,
              tolerance: 0.04,
              weight: 0.06,
            },
            {
              id: "face.height_to_width_ratio",
              type: "range",
              idealMin: 1.30,
              idealMax: 1.35,
              weight: 0.15,
            },
            {
              id: "jaw.width_to_zygoma_ratio",
              type: "range",
              idealMin: 0.78,
              idealMax: 0.84,
              weight: 0.15,
            },
            {
              id: "eyes.interpupillary_distance",
              type: "range",
              idealMin: 0.45,
              idealMax: 0.48,
              weight: 0.1,
            },
            {
              id: "face.projection_to_height_ratio",
              type: "min",
              min: 1.15,
              weight: 0.1,
            },
            {
              id: "face.convexity",
              type: "range",
              idealMin: 168,
              idealMax: 178,
              weight: 0.1,
            },
            {
              id: "profile.cervicomental_angle",
              type: "range",
              idealMin: 110,
              idealMax: 125,
              weight: 0.1,
            },
          ],
        },

        {
          id: "eye_area",
          weight: 0.25,
          metrics: [
            {
              id: "eyes.spacing_ratio",
              type: "range",
              idealMin: 0.95,
              idealMax: 1.05,
              weight: 0.2,
            },
            {
              id: "eyes.width_to_height_ratio",
              type: "range",
              idealMin: 2.6,
              idealMax: 3.2,
              weight: 0.15,
            },
            {
              id: "eyes.tilt",
              type: "range",
              idealMin: 6,
              idealMax: 8,
              weight: 0.2,
            },
            {
              id: "brows.tilt",
              type: "range",
              idealMin: 7,
              idealMax: 10,
              weight: 0.15,
            },
            {
              id: "brows.height",
              type: "boolean",
              trueScore: 10,
              falseScore: 5,
              weight: 0.15,
            },
          ],
        },

        {
          id: "midface",
          weight: 0.2,
          metrics: [
            {
              id: "midface.ratio",
              type: "range",
              idealMin: 0.98,
              idealMax: 1.05,
              weight: 0.3,
            },
            {
              id: "midface.fwhr",
              type: "range",
              idealMin: 1.75,
              idealMax: 1.9,
              weight: 0.25,
            },
            {
              id: "midface.zygoma_width_to_height_ratio",
              type: "range",
              idealMin: 1.7,
              idealMax: 1.9,
              weight: 0.25,
            },
            {
              id: "midface.cheekbone_height",
              type: "min",
              min: 0.82,
              weight: 0.2,
            },
          ],
        },

        {
          id: "nasal_region",
          weight: 0.15,
          metrics: [
            {
              id: "nose.nasofrontal_angle",
              type: "range",
              idealMin: 130,
              idealMax: 145,
              weight: 0.5,
            },
            {
              id: "nose.nasolabial_angle",
              type: "range",
              idealMin: 95,
              idealMax: 110,
              weight: 0.5,
            },
          ],
        },
      ],
    },

    {
      id: "angularity",
      weight: 0.3,
      groups: [
        {
          id: "jaw_structure",
          weight: 0.6,
          metrics: [
            {
              id: "jaw.angle",
              type: "range",
              idealMin: 120,
              idealMax: 135,
              weight: 0.2,
            },
            {
              id: "jaw.gonial_angle",
              type: "range",
              idealMin: 120,
              idealMax: 130,
              weight: 0.2,
            },
            {
              id: "jaw.mandibular_plane_angle",
              type: "range",
              idealMin: 18,
              idealMax: 28,
              weight: 0.15,
            },
            {
              id: "jaw.ramus_length",
              type: "range",
              idealMin: 0.52,
              idealMax: 0.65,
              weight: 0.15,
            },
            {
              id: "profile.chin_to_philtrum_ratio",
              type: "range",
              idealMin: 1.7,
              idealMax: 2.1,
              weight: 0.15,
            },
            {
              id: "jaw.width_to_neck_ratio",
              type: "target",
              ideal: 0.85,
              tolerance: 0.15,
              weight: 0.1,
            },
            {
              id: "jaw.center_third_width",
              type: "range",
              idealMin: 0.29,
              idealMax: 0.33,
              weight: 0.05,
            },
          ],
        },

        {
          id: "ocular_structure",
          weight: 0.15,
          metrics: [
            {
              id: "eyes.orbital_vector",
              type: "categorical",
              scores: {
                positive: 10,
                neutral: 6,
                negative: 2,
              },
              weight: 1,
            },
          ],
        },
      ],
    },

    {
      id: "dimorphism",
      weight: 0.15,
      groups: [
        {
          id: "feminine_structure",
          weight: 1,
          metrics: [
            {
              id: "jaw.width_to_zygoma_ratio",
              type: "range",
              idealMin: 0.78,
              idealMax: 0.84,
              weight: 0.25,
            },
            {
              id: "jaw.ramus_length",
              type: "range",
              idealMin: 0.52,
              idealMax: 0.65,
              weight: 0.25,
            },
            {
              id: "jaw.gonial_angle",
              type: "range",
              idealMin: 120,
              idealMax: 130,
              weight: 0.25,
            },
            {
              id: "midface.fwhr",
              type: "range",
              idealMin: 1.75,
              idealMax: 1.9,
              weight: 0.25,
            },
          ],
        },
      ],
    },
  ],
}
