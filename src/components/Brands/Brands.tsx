import styles from './page.module.css'
import Project from './project/Index'

export default function Brands() {

  const projects = [
    {
      title1: "DACIA",
      title2: "DACIA",
      src: "https://amseelcars.com/wp-content/uploads/2025/03/dacia-01.svg"
    },
    {
      title1: "La",
      title2: "Grange",
      src: "https://amseelcars.com/wp-content/uploads/2025/03/Volkswagen-01.svg"
    },
    {
      title1: "Deux Huit",
      title2: "Huit",
      src: "https://amseelcars.com/wp-content/uploads/2025/03/Hyundai-01.svg"
    },
    {
      title1: "Nothing",
      title2: "Design Studio",
      src: "https://amseelcars.com/wp-content/uploads/2025/03/kia-01.svg"
    },
    {
      title1: "Mambo",
      title2: "Mambo",
      src: "https://amseelcars.com/wp-content/uploads/2025/03/bmw-01.svg"
    }
  ]

  return (
    <main className={styles.main}>
      <div className={styles.gallery}>
        <p className='tex text-white text-5xl'>Brands</p>
          {
            projects.map( (project, index) => {
              return <Project key={index} project={project} />
            })
          }
      </div>
    </main>
  )
}