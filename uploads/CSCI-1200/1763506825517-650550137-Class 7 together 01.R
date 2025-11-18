dat <- read.csv("For Analaysis group 1.csv")

head(dat)
str(dat)
install.packages(tidyverse)
library(tidyverse)

# summarize the data
# use group_by
head(dat)
avg <- dat %>% group_by(Species, Treatment) %>% 
  summarise(mean = mean(Abs),
            sd = sd(Abs))

avg

unique(avg$Species)
avg$Species <- factor(avg$Species, 
                      levels = c('bkg', 'A. hyd',
  'B. sub', 'C.fre', 'E.col', 'P.flu', 'S. epi', 'S. mar'))
# check spelling and punctuation on line above when you do the second set of data
# match to what is in data set
# head(avg)
# 
ggplot(data = avg, aes(x = Species, y = mean, fill = Treatment))+
  geom_bar(stat= "identity", position = "dodge")+
geom_errorbar(aes(ymin = mean - sd, ymax = mean + sd), position ="dodge")+
  theme_classic()+
  ylab("Bacteria Proxy (Abs)")
# see na species in your second plot? check the spelling and punctuation in the above step
# where you re order everything 
# anova
# on entire data set
head(dat)

res.aov2 <- aov(Abs ~ Treatment + Species, data=dat)
summary(res.aov2)


# anova gets more complicated than this, but this is where we will stop
# interpretation treatments make bacteria grow differently
# species of bacteria have different growth rates 
