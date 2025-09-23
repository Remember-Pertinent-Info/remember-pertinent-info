# **Remember Pertinent Information**

## Vision:

Our vision is to create a web platform that maps the learning landscape and guides students through it with clarity. The app will connect concepts, skills, and classes into a living network, allowing students to see exactly which abilities a course requires and which new competencies it develops. Professors will be able to publish modules, posts, and quizzes that teach or evaluate specific skills, giving students immediate feedback on their preparedness and helping them track their growth over time.

The system will combine curated knowledge with live data from university course catalogs. Automated scrapers will update official information like course descriptions and prerequisites, while professors and verified users can refine and expand the database with richer skill mappings and recommended study materials. This dual approach ensures the platform remains accurate, current, and deeply informative.

For educators, the platform will provide simple tools to create content and link it directly to the skills and classes it supports. For students, it will function as an interactive map of their academic journey, showing which courses they are eligible for, highlighting gaps in their knowledge, and recommending quizzes or resources to close those gaps. The end goal is a transparent, dynamic guide to learning—one that helps every user understand where they stand, what they can tackle next, and how to prepare for the challenges ahead.

## Stack:

* HTML  
* CSS/Tailwind  
* React/TS  
* MongoDB?  
* PostgreSQL

### Local Development

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Semester Specific Goals:

Our first step is to  analyze and interface with the Course Scaffold website from a previous RCOS project. It is defunct, and if we can get it up and running we could potentially utilize it as a baseline user interface tool and database to build our project from.

If we are unable to get a working version of the Course Scaffold website, our next step will be to build our own course framework and user interface. 

The next step once we have created a functional course framework with a user interface is to allow for user posts, such as quizzes, videos, and text-based posts.

Finally, we will ensure that our database accurately and dynamically reflects RPI course offerings, and work on polishing the look of the project to be appealing to users. We will reach out to professors and encourage them to utilize the resource, additionally seeking end user feedback from their experiences to improve the project.

## Milestones:

### September:

* Recover any code and data from the previous project  
* Repair any code found to create a basic starting point

### October:

* Produce a functional backend that can retrieve information from RPI’s already existing databases  
* Create a database to store out course clusters and other application-specific data  
* Create a home page to allow users to find uploaded content

### November:

* Enable some sort of sign-in/verification method for teachers/students (use duo?)  
* Allow professors to produce their own content

### December:

* Produce a means for professors to create and upload interactive content (implementation of modules)  
* Outreach, try to get users to create content for the site/students.

## Team Members:

Jacob Hudnut, [hudnuj@rpi.edu](mailto:hudnuj@rpi.edu), 4 credits  
Oliver Centner, [centno@rpi.edu](mailto:centno@rpi.edu), 4 credits  
Ronan Hevenor, [hevenr@rpi.edu](mailto:hevenr@rpi.edu), 2 credits  
Dan Liu, [liuy77@rpi.edu](mailto:liuy77@rpi.edu), 2 credits

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!