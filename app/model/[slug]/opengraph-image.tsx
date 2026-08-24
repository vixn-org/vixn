import { ImageResponse } from "next/og";
import connectDB from "@/lib/db";
import Model from "@/lib/models/model";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await connectDB();
  const model = await Model.findOne({
    slug: { $regex: new RegExp(`^${slug}$`, "i") },
  }).lean();

  if (!model) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 64,
            background: "#ffffff",
            color: "#0f172a",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
          }}
        >
          VIXN.fun
        </div>
      ),
      size
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px",
          background: "#ffffff",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: 900,
              color: "#e11d48",
              letterSpacing: "1px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            🔥 VIXN<span style={{ color: "#0f172a" }}>.fun</span>
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#475569",
              background: "#f1f5f9",
              borderRadius: "24px",
              padding: "8px 24px",
              border: "1px solid #e2e8f0",
            }}
          >
            Verified Model Portfolio
          </div>
        </div>

        {/* Center Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div
            style={{
              fontSize: 68,
              fontWeight: 900,
              color: "#0f172a",
              lineHeight: 1.1,
              letterSpacing: "-1.5px",
            }}
          >
            {model.name}
          </div>
          <div
            style={{
              fontSize: 24,
              color: "#64748b",
              maxWidth: "850px",
              lineHeight: 1.4,
            }}
          >
            {model.metaDescription ||
              `Explore ${model.name}'s exclusive photo gallery and video collection on VIXN.fun`}
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "8px",
            }}
          >
            {model.category && (
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#e11d48",
                  background: "#ffe4e6",
                  borderRadius: "12px",
                  padding: "6px 18px",
                }}
              >
                {model.category}
              </div>
            )}
            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "#334155",
                background: "#f1f5f9",
                borderRadius: "12px",
                padding: "6px 18px",
                border: "1px solid #e2e8f0",
              }}
            >
              {model.media?.length || 0} Media Assets
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "2px solid #f1f5f9",
            paddingTop: "24px",
          }}
        >
          <div
            style={{
              fontSize: 18,
              color: "#94a3b8",
              fontWeight: 500,
            }}
          >
            https://vixn.fun/model/{model.slug}
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#059669",
            }}
          >
            ✓ Verified Profile
          </div>
        </div>
      </div>
    ),
    size
  );
}
