import type { Model } from "../types/model"

export const caucasianMaleModel: Model = {
  id: "caucasian_male",
  pillars: [
    /* =====================================================
       HARMONY
    ===================================================== */
    {
      id: "harmony",
      weight: 0.35,
      groups: [
        /* -------------------------
           GLOBAL PROPORTIONS
        ------------------------- */
        {
          id: "global_proportions",
          weight: 0.4,
          metrics: [
            {
              id: "face.upper_third_height",
              type: "target",
              ideal: 0.32,
              tolerance: 0.04,
              weight: 0.07,
            },
            {
              id: "face.mid_third_height",
              type: "target",
              ideal: 0.32,
              tolerance: 0.04,
              weight: 0.07,
            },
            {
              id: "face.lower_third_height",
              type: "target",
              ideal: 0.36,
              tolerance: 0.04,
              weight: 0.06,
            },
            {
              id: "face.height_to_width_ratio",
              type: "range",
              idealMin: 1.33,
              idealMax: 1.38,
              weight: 0.15,
            },
            {
              id: "jaw.width_to_zygoma_ratio",
              type: "range",
              idealMin: 0.88,
              idealMax: 0.92,
              weight: 0.15,
            },
            {
              id: "eyes.interpupillary_distance",
              type: "range",
              idealMin: 0.44,
              idealMax: 0.47,
              weight: 0.1,
            },
            {
              id: "face.projection_to_height_ratio",
              type: "min",
              min: 1.2,
              weight: 0.1,
            },
            {
              id: "face.convexity",
              type: "range",
              idealMin: 165,
              idealMax: 175,
              weight: 0.1,
            },
            {
              id: "profile.cervicomental_angle",
              type: "range",
              idealMin: 105,
              idealMax: 115,
              weight: 0.1,
            },
          ],
        },

        /* -------------------------
           EYE AREA
        ------------------------- */
        {
          id: "eye_area",
          weight: 0.25,
          metrics: [
            {
              id: "eyes.spacing_ratio",
              type: "range",
              idealMin: 0.9,
              idealMax: 1.02,
              weight: 0.2,
            },
            {
              id: "eyes.width_to_height_ratio",
              type: "range",
              idealMin: 2.8,
              idealMax: 3.6,
              weight: 0.15,
            },
            {
              id: "eyes.tilt",
              type: "range",
              idealMin: 5.5,
              idealMax: 6.5,
              weight: 0.2,
            },
            {
              id: "brows.tilt",
              type: "range",
              idealMin: 5,
              idealMax: 7,
              weight: 0.15,
            },
            {
              id: "brows.height",
              type: "boolean",
              trueScore: 10,
              falseScore: 4,
              weight: 0.15,
            },
          ],
        },

        /* -------------------------
           MIDFACE
        ------------------------- */
        {
          id: "midface",
          weight: 0.2,
          metrics: [
            {
              id: "midface.ratio",
              type: "range",
              idealMin: 0.95,
              idealMax: 1.02,
              weight: 0.3,
            },
            {
              id: "midface.fwhr",
              type: "range",
              idealMin: 1.9,
              idealMax: 2,
              weight: 0.25,
            },
            {
              id: "midface.zygoma_width_to_height_ratio",
              type: "range",
              idealMin: 1.8,
              idealMax: 2,
              weight: 0.25,
            },
            {
              id: "midface.cheekbone_height",
              type: "min",
              min: 0.8,
              weight: 0.2,
            },
          ],
        },

        /* -------------------------
           NASAL REGION
        ------------------------- */
        {
          id: "nasal_region",
          weight: 0.15,
          metrics: [
            {
              id: "nose.nasofrontal_angle",
              type: "range",
              idealMin: 115,
              idealMax: 130,
              weight: 0.5,
            },
            {
              id: "nose.nasolabial_angle",
              type: "range",
              idealMin: 90,
              idealMax: 105,
              weight: 0.5,
            },
          ],
        },
      ],
    },

    /* =====================================================
       ANGULARITY
    ===================================================== */
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
              idealMin: 110,
              idealMax: 125,
              weight: 0.2,
            },
            {
              id: "jaw.gonial_angle",
              type: "range",
              idealMin: 110,
              idealMax: 115,
              weight: 0.2,
            },
            {
              id: "jaw.mandibular_plane_angle",
              type: "range",
              idealMin: 14,
              idealMax: 23,
              weight: 0.15,
            },
            {
              id: "jaw.ramus_length",
              type: "range",
              idealMin: 0.6,
              idealMax: 0.78,
              weight: 0.15,
            },
            {
              id: "profile.chin_to_philtrum_ratio",
              type: "range",
              idealMin: 2,
              idealMax: 2.5,
              weight: 0.15,
            },
            {
              id: "jaw.width_to_neck_ratio",
              type: "target",
              ideal: 1,
              tolerance: 0.15,
              weight: 0.1,
            },
            {
              id: "jaw.center_third_width",
              type: "range",
              idealMin: 0.33,
              idealMax: 0.36,
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
                neutral: 5,
                negative: 1,
              },
              weight: 1,
            },
          ],
        },
      ],
    },

    /* =====================================================
       DIMORPHISM
    ===================================================== */
    {
      id: "dimorphism",
      weight: 0.15,
      groups: [
        {
          id: "masculine_structure",
          weight: 1,
          metrics: [
            {
              id: "jaw.width_to_zygoma_ratio",
              type: "range",
              idealMin: 0.88,
              idealMax: 0.92,
              weight: 0.25,
            },
            {
              id: "jaw.ramus_length",
              type: "range",
              idealMin: 0.6,
              idealMax: 0.78,
              weight: 0.25,
            },
            {
              id: "jaw.gonial_angle",
              type: "range",
              idealMin: 110,
              idealMax: 115,
              weight: 0.25,
            },
            {
              id: "midface.fwhr",
              type: "range",
              idealMin: 1.9,
              idealMax: 2,
              weight: 0.25,
            },
          ],
        },
      ],
    },

    /* =====================================================
       QUALITIES
    ===================================================== */
    {
      id: "qualities",
      weight: 0.2,
      groups: [
        {
          id: "skin",
          weight: 0.45,
          metrics: [
            {
              id: "skin.quality",
              type: "categorical",
              scores: {
                poor: 2,
                fair: 5,
                good: 8,
                excellent: 10,
              },
              weight: 1,
            },
          ],
        },
        {
          id: "symmetry",
          weight: 0.25,
          metrics: [
            {
              id: "symmetry.overall",
              type: "categorical",
              scores: {
                low: 2,
                moderate: 5,
                high: 8,
                exceptional: 10,
              },
              weight: 1,
            },
          ],
        },
        {
          id: "fat",
          weight: 0.2,
          metrics: [
            {
              id: "fat.level",
              type: "categorical",
              scores: {
                high: 2,
                moderate: 5,
                lean: 8,
                very_lean: 10,
              },
              weight: 1,
            },
          ],
        },
        {
          id: "expression",
          weight: 0.1,
          metrics: [
            {
              id: "expression.neutrality",
              type: "categorical",
              scores: {
                tense: 3,
                neutral: 6,
                positive: 10,
              },
              weight: 1,
            },
          ],
        },
      ],
    },
  ],
}
