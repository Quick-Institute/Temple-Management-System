import { bannerRoles } from "./bannerRoles";

export default function WelcomeBanner({ user, role = user?.role ?? 'family', firstName = user?.firstName, templeName = user?.templeName }) {
  const config = bannerRoles[role] ?? bannerRoles.family;
  const family = config.variant === 'family';
  const systemTypography = config.variant === 'system';
  const templeTypography = role === 'templeAdmin' || role === 'coAdmin' || systemTypography;
  const familyTypography = family || templeTypography;
  const heading = family
    ? `${firstName?.trim() || 'Kamal'}!`
    : config.variant === 'temple'
      ? `${templeName?.trim() || 'Kataragama Temple'}!`
      : 'Super Admin!';
  return (
    <section
      className={`relative -mt-3 ${systemTypography ? "h-[346px]" : "h-[330px]"} w-full overflow-hidden rounded-2xl lg:h-[224px] ${family ? "family-welcome-banner" : ""}`}
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(255,246,225,0.96) 0%, rgba(252,237,200,0.90) 26%, rgba(255,244,218,0.82) 45%, rgba(255,246,225,0.65) 56%, rgba(255,246,225,0.24) 68%, rgba(255,246,225,0) 80%), url('/banner.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Welcome text - left side */}
      <div className={templeTypography ? "absolute left-6 top-5 z-10 max-w-[calc(100%-48px)] sm:left-10 lg:max-w-[43%]" : family ? "family-banner-copy absolute left-6 top-6 z-10 max-w-[330px] sm:left-10" : "absolute left-6 top-6 z-10 max-w-[calc(100%-48px)] sm:left-8 lg:max-w-[43%]"}>
        <p className={familyTypography ? "font-georgia text-[20px] font-normal leading-[1.25] text-[#183D30]" : "font-georgia text-[18px] font-semibold leading-[1.25] text-[#101C35]"}>
          Welcome back,
        </p>

        <h1 className={templeTypography ? "mt-1 font-georgia text-[32px] font-bold leading-[1.08] text-[#14523B] lg:text-[37.5px] lg:leading-[38.88px]" : family ? "mt-1 font-georgia text-[48px] font-bold leading-[1.08] text-[#14523B]" : "mt-1 font-georgia text-[28px] font-bold leading-[1.08] text-[#073D2B] xl:text-[32px]"}>
          {heading}
        </h1>

        <p className={familyTypography ? `mt-1.5 ${systemTypography ? 'max-w-[420px]' : 'max-w-[310px]'} font-georgia text-[17px] leading-[1.35] text-[#234936]` : "mt-2 font-georgia text-[16px] leading-[1.35] text-[#101C35]"}>
          {config.description[0]}
          <br />
          {config.description[1]}
        </p>

        <div className={templeTypography ? "mt-3 h-px w-14 scale-y-150 bg-[#B99A39]" : familyTypography ? "mt-3 h-px w-14 bg-[#B99A39]" : "mt-3 h-[3px] w-16 rounded-full bg-[#C58C13]"} />
      </div>

      {/* Lotus quotation - centre */}
      <div className={family ? "family-banner-quote absolute left-1/2 top-[204px] z-10 flex w-[230px] -translate-x-1/2 flex-col items-center rounded-xl bg-[#FFF4D8]/90 p-3 text-center lg:left-[47%] lg:top-1/2 lg:w-[210px] lg:-translate-y-1/2 lg:bg-transparent lg:p-0" : "absolute left-1/2 top-[204px] z-10 flex w-[230px] -translate-x-1/2 flex-col items-center rounded-xl bg-[#FFF4D8]/90 p-3 text-center lg:left-[60%] lg:top-1/2 lg:w-[190px] lg:-translate-y-1/2 lg:bg-transparent lg:p-0 xl:left-[54%]"}>
        <img
          src="/banner_lotus.svg"
          alt=""
          aria-hidden="true"
          className="mb-2 h-7 w-14 object-contain"
        />

        <p className={familyTypography ? "font-georgia text-[14px] italic leading-[1.5] text-[#354638]" : "font-georgia text-[14px] italic leading-[1.5] text-[#101C35]"}>
          “May all beings be happy,
          <br />
          healthy and at peace.”
        </p>

        <img
          src="/banner_lotus_divider.svg"
          alt=""
          aria-hidden="true"
          className="mt-1 h-7 w-20 object-contain"
        />
      </div>
    </section>
  )
}

