export default function PageBanner({title, description, image}) {
    return (
        <section className="relative h-40 w-full overflow-hidden bg-[#eff8fb] sm:h-46">
            <img
                src={image}
                alt=""
                aria-hidden="true"
                fetchPriority="high"
                className="absolute inset-y-0 right-0 h-full w-auto max-w-none object-cover object-right [mask-image:linear-gradient(to_right,transparent_0%,rgba(0, 0, 0,0.55)_22%,#000_48%)]"
            />
            {/* Small screens: image sits behind the text, so add a stronger cream wash for contrast. */}
            <div aria-hidden="true"
                 className="absolute inset-0 bg-linear-to-r from-[#eff8fb] via-[#eff8fb]/80 to-transparent md:hidden"/>

            <div
                className="relative z-10 flex h-full max-w-[calc(100%-24px)] flex-col justify-center px-5 pb-6 sm:px-8 sm:pb-9 lg:max-w-[55%]">
                <h1 className="font-georgia text-[28px] font-bold leading-[1.1] text-[#143d52] sm:text-[36px]">{title}</h1>
                <p className="mt-1.5 font-georgia text-[14px] leading-[1.35] text-[#233c49] sm:text-[17px]">{description}</p>
            </div>
        </section>
    );
}