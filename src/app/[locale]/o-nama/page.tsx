import { getTranslations, setRequestLocale } from "next-intl/server";
import { getTeam } from "@/lib/queries";
import { FadeIn, FadeInLeft, FadeInRight } from "@/components/ui/motion-wrapper";
import { ButtonLink } from "@/components/ui/button";
import { ContactModalTrigger } from "@/components/contact/contact-modal-trigger";
import { ValueCard } from "@/components/about/value-card";
import { Shield, Clock, DollarSign, Headphones, Quote, User } from "lucide-react";
import Image from "next/image";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("title") };
}

export default async function ONamePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "about" });
  const team = await getTeam();

  const values = [
    {
      decoIcon: <Shield size={144} strokeWidth={1} />,
      title: t("value1Title"),
      text: t("value1Text"),
      variant: "petrol" as const,
    },
    {
      decoIcon: <Clock size={144} strokeWidth={1} />,
      title: t("value2Title"),
      text: t("value2Text"),
      variant: "ink" as const,
    },
    {
      decoIcon: <DollarSign size={144} strokeWidth={1} />,
      title: t("value3Title"),
      text: t("value3Text"),
      variant: "light" as const,
    },
    {
      decoIcon: <Headphones size={144} strokeWidth={1} />,
      title: t("value4Title"),
      text: t("value4Text"),
      variant: "cyan" as const,
    },
  ];

  return (
    <div className="bg-bg">
      {/* Hero — image + overlapping welcome card */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-20">
        <div className="container-page">
          <div className="flex flex-col lg:flex-row lg:items-start">
            <FadeIn className="relative w-full lg:w-[55%] shrink-0">
              <div
                className="overflow-hidden bg-bg-secondary"
                style={{ borderRadius: "16px", aspectRatio: "4/3" }}
              >
                <Image
                  src="/images/categories/ventilokonvektori.jpg"
                  alt={t("welcomeTitle1")}
                  width={720}
                  height={540}
                  priority
                  className="w-full h-full object-cover"
                />
              </div>
            </FadeIn>

            {/* Welcome card — overlaps image's right edge */}
            <FadeInRight
              delay={0.1}
              className="relative z-10 bg-white p-8 md:p-10 lg:-ml-16 mt-6 lg:mt-16 lg:max-w-md rounded-2xl shadow-[0_32px_80px_rgba(29,35,41,0.12)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-champagne mb-4">
                {t("welcomeEyebrow")}
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-ink tracking-tight leading-snug mb-4">
                {t("welcomeTitle1")}
                <br />
                {t("welcomeTitle2")}
              </h1>
              <p className="text-sm text-muted leading-relaxed mb-6">
                {t("welcomeText")}
              </p>
              <ButtonLink href="/proizvodi" variant="primary" size="sm">
                {t("readMore")}
              </ButtonLink>
            </FadeInRight>
          </div>

          {/* Stats row */}
          <FadeIn delay={0.2} className="flex gap-14 mt-10 lg:mt-14 lg:pl-[calc(55%-4rem)]">
            <div>
              <p className="text-4xl font-black text-ink tracking-tight mb-1">
                {t("statYearsValue")}
              </p>
              <p className="text-sm text-muted">{t("statYearsLabel")}</p>
            </div>
            <div>
              <p className="text-4xl font-black text-ink tracking-tight mb-1">
                {t("statProductsValue")}
              </p>
              <p className="text-sm text-muted">{t("statProductsLabel")}</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Why choose us */}
      <section className="bg-bg-secondary section-lg">
        <div className="container-page">
          <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-12 items-start">
            <FadeInLeft>
              <h2 className="text-3xl font-bold text-ink tracking-tight mb-5">
                {t("whyChooseTitle")}
              </h2>
              <p className="text-muted text-lg leading-relaxed mb-8">
                {t("whyChooseText")}
              </p>
              <ButtonLink href="/proizvodi" variant="ghost">
                {t("viewAll")}
              </ButtonLink>
            </FadeInLeft>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {values.map(({ decoIcon, title, text, variant }, i) => (
                <FadeIn key={title} delay={i * 0.08}>
                  <ValueCard decoIcon={decoIcon} title={title} text={text} variant={variant} />
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="section-lg">
        <div className="container-page">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-10 items-center">
            <FadeInLeft>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-champagne mb-4">
                {t("storyEyebrow")}
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-ink tracking-tight leading-tight mb-5">
                {t("storyTitle1")}
                <br />
                {t("storyTitle2")}
              </h2>
              <p className="text-muted text-lg leading-relaxed mb-8 max-w-md">
                {t("storyText")}
              </p>
              <ContactModalTrigger variant="primary">
                {t("storyCta")}
              </ContactModalTrigger>
            </FadeInLeft>

            <FadeInRight delay={0.1} className="relative">
              <div
                className="overflow-hidden bg-bg-secondary"
                style={{ borderRadius: "16px", aspectRatio: "4/3" }}
              >
                <Image
                  src="/images/categories/veseraj.jpg"
                  alt={t("storyTitle1")}
                  width={640}
                  height={480}
                  className="w-full h-full object-cover"
                />
              </div>

              <div
                className="hidden md:block absolute bg-white p-6 max-w-[300px]"
                style={{
                  borderRadius: "16px",
                  boxShadow: "0 24px 60px rgba(29,35,41,0.14)",
                  bottom: "-1.5rem",
                  left: "-2rem",
                }}
              >
                <Quote size={20} strokeWidth={1.5} className="text-champagne mb-3" />
                <p className="text-sm text-ink leading-relaxed mb-3 italic">
                  &ldquo;{t("quoteText")}&rdquo;
                </p>
                <p className="text-xs font-semibold text-muted uppercase tracking-wider">
                  {t("quoteAuthor")}
                </p>
              </div>
            </FadeInRight>
          </div>
        </div>
      </section>

      {/* Tim */}
      {team.length > 0 && (
        <section className="section-lg bg-bg-secondary">
          <div className="container-page">
            <FadeIn className="mb-12">
              <h2 className="text-3xl font-bold text-ink tracking-tight text-center">
                {t("teamTitle")}
              </h2>
            </FadeIn>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {team.map((member, i) => {
                const role =
                  locale === "sl" ? member.role_sl :
                  locale === "en" ? member.role_en :
                  member.role_hr;

                return (
                  <FadeIn key={member.id} delay={i * 0.08}>
                    <div className="text-center">
                      <div
                        className="relative w-24 h-24 mx-auto mb-4 bg-bg-secondary overflow-hidden"
                        style={{ borderRadius: "50%" }}
                      >
                        {member.photoUrl ? (
                          <Image
                            src={member.photoUrl}
                            alt={member.name}
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <User size={32} strokeWidth={1.2} className="text-muted/40" />
                          </div>
                        )}
                      </div>
                      <p className="font-semibold text-ink text-sm">{member.name}</p>
                      {role && <p className="text-xs text-muted mt-1">{role}</p>}
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
