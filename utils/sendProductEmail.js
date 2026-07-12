const { Resend } = require("resend");
const Subscriber = require("../models/Subscriber");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendNewProductEmail = async (product) => {
  try {
    const subscribers = await Subscriber.find({});
    if (subscribers.length === 0) return;

    const emails = subscribers.map((s) => s.email);

    await resend.emails.send({
      from: "Mitti <onboarding@resend.dev>", // test domain, will update once custom domain is verified
      to: emails,
      subject: `New Arrival: ${product.name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #6B4530;">New at Mitti!</h2>
          <img src="${product.images?.[0] || ""}" alt="${product.name}" style="width: 100%; border-radius: 8px; margin: 12px 0;" />
          <h3 style="color: #6B4530;">${product.name}</h3>
          <p style="color: #8B6F5C;">${product.description}</p>
          <p style="font-size: 18px; font-weight: bold; color: #6B4530;">Rs. ${product.price}</p>
          <a href="https://mitti-client.vercel.app/product/${product._id}" 
             style="display: inline-block; background: #6B4530; color: white; padding: 10px 24px; border-radius: 999px; text-decoration: none; margin-top: 12px;">
            Shop Now
          </a>
        </div>
      `,
    });

    console.log(`New product email sent to ${emails.length} subscribers`);
  } catch (error) {
    console.error("Error sending new product email:", error.message);
    // Don't throw — email failure should never block product creation
  }
};

module.exports = sendNewProductEmail;
