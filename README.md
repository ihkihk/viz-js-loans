# Data Visualization with d3.js (Project P6)

*(c) 2016 Ivailo Kassamakov, available under the MIT License*

## Summary

This project fulfills part of the requirements of the Udacity Data Analysis Nanodegree.

Its aim is creating and visualizing a story based on statistical data published by [Prosper Loans](www.prosper.com).

This *Martini-glass* type D3.js visualization is meant to lead the reader through a sequence of slides, each of them revealing a certain insight gained from the loan statistics. Additionally, the reader is free to interact with the graphics on these slides. 

The following findings are posited in the visualized story:
* People in richer states tend to take bigger loans
* People with higher income also tend to take bigger loans
* Borrowers with higher income service better their loans. The same holds true for people who have less delinquencies in the past.
* The depression of 2007-2009 affected also the otherwise growing business of Prosper

## Design

In fact, for this project I re-created the same visualization in **two different ways** - by designing it in Tableau Public, and by programming it in pure d3.js.

There were two reasons for this decision:

1. I wanted to get enough hands-on experience with both Tableau and d3.js
1. I used the Tableau version as a relatively quick way to study the dataset, try out different visualization approaches, present them to other people for feedback and draft the final version. In parallel, I was working on the d3.js version, which due to the fact that I had to learn from scratch SVG/JS/d3.js, was progressing much slower. In fact, due to time limitations, it is **still unfinished**, as it contains only the first of the four story slides.   

The final (after incorporating feedback) Tableau version can be viewed at my Tableau Public [profile](https://public.tableau.com/profile/ivailo.kassamakov#!/vizhome/ProsperLoans2nditer/Story1).

To view the d3.js viz go to [rawgit](https://rawgit.com/ihkihk/viz-js-loans/master/index.html).

### Visualization design

As mentioned above, the visualization consists of 4 slides, each one revealing a certain finding about the studied dataset. The individual slides usually features several interrelated plots. The user can freely switch between the slides, as well as *interact* with the plots in them. 

There are several type of plot interaction:
* *Brushing* - hovering the mouse over a datapoint changes its color.
* *Linking* - selecting a data point on one of the plots highlights and/or zooms the same point on the other plots.
* *Filtering* - selecting a data point on one of the plots filters the information displayed on the other plots.
* *Zooming/Panning* - these interaction modes are supported by the geographic map
* *Sorting* - the data points on some plots can be interactively sorted in increasing/decreasing/lexicographical order.
* *Identification* - hovering or selecting a datapoint causes an information bubble (label) to appear. This allows for precise reading of the datapoint coordinates.

To add continuity and fluidity to the plot changes triggered by the reader, most of the interactions are *animated*.

In general, the story design allows for fulfilling the major paradigm of information seeking - *"Overview first, zoom and filter, then details on demand"*.


#### Slide 1

The first slide shows that people living in richer states tend to take bigger credits. The definition of a "richer" state is one having higher per-capita income (GDP divided by the amount of population). I brought in the "per-capita" information from an additional dataset found on [Wikipedia](https://en.wikipedia.org/wiki/List_of_U.S._states_by_income). This new dataset was joined with the Prosper loans dataset.

This slide contains the following plots:
* Barplot showing the median per-capita income for each US state.
* A choropleth map of the US, where each state's per capita income is coded with a different color intensity. 
* A scatter plot relating the per-capita income with the average loan amount for each US state. This plot reveals the main finding that there is a positive correlation between both factors. To better visualize it, a linear (least squares) regression model line is fitted on top of the scatter plot.

Based on the feedback received, I performed the following changes to the initial viz prototype:
* The US state barplot was changed from vertical to horizontal bar layout. The position of the barplot and the scatter plot were exchanged. Both steps achieved better overall space utilization.
* A color legend was added to the choropleth map, and the color hue was changed from brown-red to blue for uniformity.

#### Slide 2

The second slide tells that there is a positive correlation between the annual income and the average amount of the borrowed loan. This is best of all seen on the scatter plot, where the datapoints represent the different professions. Again an LSRL is fitted on the datapoints to better visualize the relationship.

The other plot of this slide is a histogram of the average loan amount. It is filterable by occupation of the borrower. The two plots are interrelated, whereby an occupation datapoint selected on the scatter plot directly serves as a filter for the histogram.

The histogram reveals that borrowers prefer to take loan amounts that are multiple of $5K. As one of the feedback providers noted, there is also a pronounced peak at $4K. I couldn't find the reason for this (could be due to tax policies for example?), however I annotated the graphic with this interesting finding.

This slide was most heavily overhauled based on the received feedback. In the first version of the visualization I had tried to present the income-loan correlation in a rather confusing way using two stacked barplots. Later they were replaced by the scatterplot.

#### Slide 3

The next slide sheds some light on how the status of the Prosper loan correlates with income and past credit behavior of the borrower. The status can be either OK (i.e. serviced without delays) or problematic (delayed, charged-off or defaulted).

Three plots present the information:
* A box-and-whiskers plot summarizing the statistics for the borrowers' incomes for each group loan statuses. It clearly shows that higher income correlates with better status of the loan.
* A barplot showing the average amount of past credit delinquencies perpetrated by the borrowers in each group of loan statuses. Again, there is a positive relationship between the number of delinquencies and the problematic status of the current Prosper loan.
* A packed-bubbles plot finally provides some additional context by showing a breakdown of the relative amount of loans in the 4 status groups. According to it, the loans with OK status form the absolute majority.

The initial version of the visualization didn't contain the box-and-whiskers chart. It was prompted by one of the reviewers, who found that it would be logical to continue the narrative of the previous slides by exploring the correlation between the borrower's income and the status of their loan.

#### Slide 4

The last slide of the narrative tells a time story - how the average amount and number of loans have evolved during the years. It's pretty easy to see to the depressing effect of the financial crisis of 2007-2009.

Two stacked time-series charts made predominantly of line plots serve the purpose. The line plots were selected as they are usually the most appropriate medium for visualizing time-series information.

The upper chart combines a line plot showing the average loan amount through the years with a barplot of the number of loans borrowed during each time period (in this case - quarters). Initially I doubted about showing the number of loans also with a line chart. Several reviewers however saw the lineplot-superimposed-on-barplot visually more appealing, as well as underlining the different nature of the two variables. 

While the upper chart shows the total average loan amount, the bottom one presents the same information faceted by borrower's occupation. The reader is free to select one or more occupations to be plotted. An additional regression dashed line helps view the overall trend.

This slide didn't exist in the initial versions of the visualization and was added exclusively as a result of reviewer's feedback.


### Program design

The visualization is programmed in 100% vanilla JS/SVG/CSS3 using version 4.0 of d3.js. It is based on a MVC architecture, whereby each plot is a separate *View*, served by its own *Controller*. There is a separate higher-level Controller for each story slide that takes care of the interactions between the plots. A dedicated *Model* handles everything data-related, e.g. data loading and number crunching.

Some details about the code:
* I started developing the program first in Atom, then I passed to the [C9.io](c9.io) online editor. I've managed the development entirely in github, following a complete workflow with opening/closing issues, milestone planning and pull requests.
* The code was continuously analyzed (linted) with [jshint.com](jshint.com).
* I've tried to reproduce as much interactivity and animation from the Tableau prototype as possible. E.g., all plots are interactive and mutually communicating, and the map is fully zoomable.
* The plots wait for the data to be downloaded before being drawn. This time can be considerable due to the size of the ProsperLoans data file. This is especially so if the viz app is served as a gist or rawgit content, where the data file can be transferred only in its uncompressed form (d3.js has no function to load zipped data files). On the other hand, while working in the [C9.io](c9.io) environment, I was able to configure an Apache server that served the data file in a zipped form. Combined with caching this would greatly reduce the time of the edit-deploy-test cycle.
* Trying to code GUI in pure JS/SVG (i.e. without any js framework) is very painful (although pretty enlightening).


## Feedback

As required for this project, I solicited feedback on the viz prototype from other students and from family members. At the same time I also provided numerous feedback on the Udacity forum site and on the Google+ group.

The feedbacks quoted below were obtained for the first version of the [Tableau visualization](https://public.tableau.com/profile/ivailo.kassamakov#!/vizhome/ProsperLoans/Story1)

### Feedback 1

> The first chart is clear, showing the trend between per capita income and average loan amount.
> 
> In the last chart, a definition of what charged-off will help a lot.
> 
> In addition, i think this is what the chart intends to say - For loans categorized as "OK", "delayed" etc., you are plotting the average delinquencies in each category and then showing that loans categorized as "OK" as having the lowest number of delinquencies. However, I am not able to understand how that results in the conclusion, that people who delayed loans before, tend to repeat it.

### Feedback 2

> That's very fancy and quite a lot of information on the plot. Really nice. Here's my opinions:
>
> Is the color differ in your map has some meaning? I mean why ND is neally white and others are somewhat red. If it's colored by values, i would expect a color bar like heatmap.
>
> In the loan amount histogram, except the peaks at 10K, 15K, 20K, 25K as you mentioned, there's also a peak at 4k for some cases which I think worth mention.

### Feedback 3

> There is a lot of information to unpack in the visuals. The titles are descriptive and each of the three visuals do a good job of explaining the title based on the data. Now on to feedback:
>
>> Do you find the story coherent?
>
> The first two tabs stay with the story that higher income states and professions ask for higher loan amount. The third tab tells a different story about loan default rates. Is it possible to associate the default rate with income?
>
>> Do you find the charts clear?
>
> In the first visual, the scatter chart tells the story. The color map maybe a little ineffective as most of the map is around dark red. Try experimenting with the color scale to get a greater gradient. Also a scale would help decode the map. I am not sure of the role of the bar chart below the map. Sorting the states by per-capita income may help with the story.
>
> In the second visual, it is not clear how the conclusion that professionals taking higher credit also make higher paycheck. It may help if it is supported by average salary for each of the listed professions. As another reviewer mentioned, it is interesting to note the peak at $4k (any reason why?)
>
> In the third visual, is there a reason average is used. Have you tried using the distribution over the years for each of the category? That may show how the delinquencies varied over the years.
>
>> Is there anything you don't understand?
> 
> Most of it is covered in previous question.
> 
>> Would you like to add (or remove) something to (from) the story?
> 
> The visuals cover some interesting perspective on the loan market. Keep going with the iterations. Looking forward to the next one!!!

## Resources

All used resources are listed in [this file](./doc/useful_links.md).
