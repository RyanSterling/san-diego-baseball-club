import ContactForm from "@/components/contact/ContactForm";

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-headline text-4xl uppercase tracking-tight text-dark mb-2">
        Contact Us
      </h1>
      <p className="text-dark/60 mb-8">
        Have a question, suggestion, or want to get in touch? Send us a message!
      </p>
      <div className="bg-white shadow-sm p-6 md:p-8">
        <ContactForm />
      </div>
    </div>
  );
}
